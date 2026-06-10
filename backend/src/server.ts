import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import prisma from './db';
import { 
  generateAudienceFilters, 
  generateCampaign, 
  runCopilotChat, 
  StructuredFilter 
} from './services/ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:5001/send';

// Helper to update CampaignAnalytics in real time
async function updateCampaignAnalytics(campaignId: string) {
  try {
    const communications = await prisma.communication.findMany({
      where: { campaignId }
    });

    const sentCount = communications.length;
    let deliveredCount = 0;
    let openedCount = 0;
    let clickedCount = 0;
    let failedCount = 0;

    communications.forEach(c => {
      if (c.status === 'DELIVERED') deliveredCount++;
      else if (c.status === 'OPENED') {
        deliveredCount++;
        openedCount++;
      } else if (c.status === 'CLICKED') {
        deliveredCount++;
        openedCount++;
        clickedCount++;
      } else if (c.status === 'FAILED') {
        failedCount++;
      }
    });

    await prisma.campaignAnalytics.upsert({
      where: { campaignId },
      create: {
        campaignId,
        sentCount,
        deliveredCount,
        openedCount,
        clickedCount,
        failedCount
      },
      update: {
        sentCount,
        deliveredCount,
        openedCount,
        clickedCount,
        failedCount
      }
    });
  } catch (error) {
    console.error(`Error updating analytics for campaign ${campaignId}:`, error);
  }
}

// 1. GET /customers - Search, filter, and list customers
app.get('/customers', async (req: Request, res: Response) => {
  try {
    const { search, gender, city } = req.query;

    const whereClause: any = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: String(search) } },
        { email: { contains: String(search) } }
      ];
    }

    if (gender) {
      whereClause.gender = String(gender);
    }

    if (city) {
      whereClause.city = String(city);
    }

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        orders: {
          select: {
            id: true,
            amount: true,
            category: true,
            purchaseDate: true,
            product: {
              select: {
                name: true,
                brand: true
              }
            }
          }
        }
      },
      orderBy: { joinDate: 'desc' }
    });

    // Add aggregate statistics per customer
    const formattedCustomers = customers.map(c => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.amount, 0);
      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        gender: c.gender,
        joinDate: c.joinDate,
        ordersCount: c.orders.length,
        totalSpent,
        orders: c.orders
      };
    });

    res.json(formattedCustomers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. GET /orders - Fetch recent orders
app.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        customer: {
          select: { name: true, email: true }
        },
        product: {
          select: { name: true, brand: true }
        }
      },
      orderBy: { purchaseDate: 'desc' },
      take: 100 // Limit to last 100 for safety
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. GET /products - List available beauty/fashion products
app.get('/products', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { category: 'asc' }
    });
    res.json(products);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper: Filter customer list in-memory based on structured AI filters
async function getAudienceList(filters: StructuredFilter) {
  const { category, minSpend, inactiveDays } = filters;

  const customers = await prisma.customer.findMany({
    include: {
      orders: {
        select: {
          amount: true,
          category: true,
          purchaseDate: true
        }
      }
    }
  });

  return customers.filter(customer => {
    // A. Check inactivity days
    if (inactiveDays !== null && inactiveDays !== undefined) {
      const thresholdDate = new Date();
      thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);

      if (customer.orders.length > 0) {
        const latestOrderTime = Math.max(...customer.orders.map(o => new Date(o.purchaseDate).getTime()));
        const latestOrderDate = new Date(latestOrderTime);
        if (latestOrderDate > thresholdDate) {
          return false; // Ordered recently, so NOT inactive
        }
      } else {
        // No orders, check if they joined after the threshold date (recent joiners are not "inactive")
        if (new Date(customer.joinDate) > thresholdDate) {
          return false;
        }
      }
    }

    // B. Check category and minSpend
    if (category) {
      const categoryOrders = customer.orders.filter(
        o => o.category.toLowerCase() === category.toLowerCase()
      );
      
      if (categoryOrders.length === 0) {
        return false; // No orders in requested category
      }

      if (minSpend !== null && minSpend !== undefined) {
        const totalCatSpend = categoryOrders.reduce((sum, o) => sum + o.amount, 0);
        if (totalCatSpend < minSpend) {
          return false; // Category spend too low
        }
      }
    } else if (minSpend !== null && minSpend !== undefined) {
      const totalSpend = customer.orders.reduce((sum, o) => sum + o.amount, 0);
      if (totalSpend < minSpend) {
        return false; // Total spend too low
      }
    }

    return true;
  });
}

// 4. POST /audience/generate - Natural Language Audience Builder
app.post('/audience/generate', async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    // Call Gemini to convert natural language into filters
    const filters = await generateAudienceFilters(prompt);

    // Get list of matching customers
    const matchingCustomers = await getAudienceList(filters);

    // Provide a preview of the first 20 customers
    const preview = matchingCustomers.slice(0, 20).map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      city: c.city,
      gender: c.gender,
      joinDate: c.joinDate
    }));

    res.json({
      filters,
      audienceSize: matchingCustomers.length,
      preview
    });
  } catch (error: any) {
    console.error('Error generating audience:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. POST /campaigns/create - Create campaign (AI Recommended or Draft)
app.post('/campaigns/create', async (req: Request, res: Response) => {
  try {
    const { campaignName, audienceDescription, channel, message } = req.body;

    if (!campaignName || !audienceDescription || !channel || !message) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    const campaign = await prisma.campaign.create({
      data: {
        campaignName,
        audienceDescription,
        channel,
        message,
        status: 'DRAFT'
      }
    });

    // Create empty analytics row
    await prisma.campaignAnalytics.create({
      data: {
        campaignId: campaign.id,
        sentCount: 0,
        deliveredCount: 0,
        openedCount: 0,
        clickedCount: 0,
        failedCount: 0
      }
    });

    res.json(campaign);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Helper endpoint or service to call Channel Service asynchronously
async function triggerChannelDelivery(
  campaignId: string, 
  customerIds: string[], 
  channel: string, 
  message: string
) {
  // Update campaign to RUNNING
  await prisma.campaign.update({
    where: { id: campaignId },
    data: { status: 'RUNNING' }
  });

  // Create communication records in database
  for (const customerId of customerIds) {
    try {
      const comm = await prisma.communication.create({
        data: {
          campaignId,
          customerId,
          channel,
          status: 'SENT'
        }
      });

      // Send to Stub Channel Service asynchronously in background
      // This is simulated, so we don't await the result of the simulation timer, 
      // but we do await the accepted response from Channel Service.
      axios.post(CHANNEL_SERVICE_URL, {
        campaignId,
        customerId,
        channel,
        message,
        communicationId: comm.id
      }).catch(err => {
        console.error(`Failed to send communication ${comm.id} to Channel Service:`, err.message);
        // Fail it instantly in CRM DB if Channel Service cannot accept it
        prisma.communication.update({
          where: { id: comm.id },
          data: { status: 'FAILED' }
        }).then(() => updateCampaignAnalytics(campaignId));
      });

    } catch (error) {
      console.error(`Failed to initialize communication for customer ${customerId}:`, error);
    }
  }

  // Update initial analytics
  await updateCampaignAnalytics(campaignId);
}

// 6. POST /campaigns/launch - Launch draft campaign
app.post('/campaigns/launch', async (req: Request, res: Response) => {
  try {
    const { campaignId, customerIds } = req.body;

    if (!campaignId) {
      res.status(400).json({ error: 'Missing campaignId' });
      return;
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: campaignId }
    });

    if (!campaign) {
      res.status(404).json({ error: 'Campaign not found' });
      return;
    }

    let targetCustomerIds = customerIds;

    // If no explicit customerIds are sent, resolve them from the campaign audienceDescription
    if (!targetCustomerIds || targetCustomerIds.length === 0) {
      const filters = await generateAudienceFilters(campaign.audienceDescription);
      const matching = await getAudienceList(filters);
      targetCustomerIds = matching.map(c => c.id);
    }

    if (targetCustomerIds.length === 0) {
      res.status(400).json({ error: 'Audience is empty. Cannot launch campaign.' });
      return;
    }

    // Trigger asynchronous delivery
    triggerChannelDelivery(campaign.id, targetCustomerIds, campaign.channel, campaign.message);

    res.json({
      status: 'success',
      message: 'Campaign launch initiated',
      audienceSize: targetCustomerIds.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. POST /receipts - Asynchronous callback endpoint
app.post('/receipts', async (req: Request, res: Response) => {
  try {
    const { communicationId, status } = req.body;

    if (!communicationId || !status) {
      res.status(400).json({ error: 'Missing communicationId or status' });
      return;
    }

    const communication = await prisma.communication.findUnique({
      where: { id: communicationId }
    });

    if (!communication) {
      res.status(404).json({ error: 'Communication record not found' });
      return;
    }

    const updateData: any = { status: status.toUpperCase() };

    if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    } else if (status === 'opened') {
      updateData.openedAt = new Date();
    } else if (status === 'clicked') {
      updateData.clickedAt = new Date();
    }

    // Update communication status in DB
    await prisma.communication.update({
      where: { id: communicationId },
      data: updateData
    });

    // Update aggregated CampaignAnalytics in real time
    await updateCampaignAnalytics(communication.campaignId);

    // If all communications are completed, update campaign status to COMPLETED
    const totalComms = await prisma.communication.count({
      where: { campaignId: communication.campaignId }
    });
    const completedComms = await prisma.communication.count({
      where: {
        campaignId: communication.campaignId,
        status: { in: ['CLICKED', 'FAILED', 'OPENED', 'DELIVERED'] } // Note: they update incrementally
      }
    });

    // We can mark campaign as COMPLETED once the clicked/failed timeout runs out or simply after some time.
    // For simplicity, if we have callbacks, we can check if it is done. Let's update campaign status to COMPLETED if any receipt is clicked or failed,
    // or keep it running. Let's mark it COMPLETED once the last receipt is updated.
    const activeCommsCount = await prisma.communication.count({
      where: {
        campaignId: communication.campaignId,
        status: { in: ['SENT'] }
      }
    });
    if (activeCommsCount === 0) {
      await prisma.campaign.update({
        where: { id: communication.campaignId },
        data: { status: 'COMPLETED' }
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 8. GET /analytics - Aggregated performance metrics for Dashboard
app.get('/analytics', async (req: Request, res: Response) => {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalOrders = await prisma.order.count();
    const totalCampaigns = await prisma.campaign.count();
    
    const sumOrders = await prisma.order.aggregate({
      _sum: { amount: true }
    });
    const totalRevenue = sumOrders._sum.amount || 0;

    // Fetch campaigns with analytics
    const campaigns = await prisma.campaign.findMany({
      include: { analytics: true },
      orderBy: { createdAt: 'desc' }
    });

    // Formulate campaign performance data
    const campaignPerformance = campaigns
      .filter(c => c.analytics !== null)
      .map(c => ({
        id: c.id,
        name: c.campaignName,
        channel: c.channel,
        status: c.status,
        message: c.message,
        sent: c.analytics?.sentCount || 0,
        delivered: c.analytics?.deliveredCount || 0,
        opened: c.analytics?.openedCount || 0,
        clicked: c.analytics?.clickedCount || 0,
        failed: c.analytics?.failedCount || 0
      }));

    // Formulate aggregated engagement funnel
    const totalAnalytics = await prisma.campaignAnalytics.aggregate({
      _sum: {
        sentCount: true,
        deliveredCount: true,
        openedCount: true,
        clickedCount: true,
        failedCount: true
      }
    });

    const funnel = [
      { stage: 'Sent', count: totalAnalytics._sum.sentCount || 0 },
      { stage: 'Delivered', count: totalAnalytics._sum.deliveredCount || 0 },
      { stage: 'Opened', count: totalAnalytics._sum.openedCount || 0 },
      { stage: 'Clicked', count: totalAnalytics._sum.clickedCount || 0 }
    ];

    // Formulate segments distribution (revenue by category)
    const categoryRevenue = await prisma.order.groupBy({
      by: ['category'],
      _sum: { amount: true },
      _count: { id: true }
    });

    const segmentSales = categoryRevenue.map(cr => ({
      name: cr.category,
      revenue: cr._sum.amount || 0,
      orders: cr._count.id
    }));

    res.json({
      summary: {
        totalCustomers,
        totalOrders,
        totalCampaigns,
        totalRevenue
      },
      campaignPerformance,
      funnel,
      segmentSales
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 9. POST /copilot/chat - Campaign AI Copilot
app.post('/copilot/chat', async (req: Request, res: Response) => {
  try {
    const { history, prompt } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Missing prompt' });
      return;
    }

    // Try to pre-extract filters from user prompt to provide real DB context
    const filters = await generateAudienceFilters(prompt);
    let count = 0;
    
    // If we extracted a filter, query customer count
    if (filters.category || filters.minSpend || filters.inactiveDays) {
      const list = await getAudienceList(filters);
      count = list.length;
    }

    // Call Copilot Chat with computed database context
    const reply = await runCopilotChat(history, prompt, {
      count,
      filters
    });

    res.json({ reply });
  } catch (error: any) {
    console.error('Error in Copilot Chat:', error);
    res.status(500).json({ error: error.message });
  }
});

// 10. POST /campaigns/generate-preview - Used in Campaign Builder UI to recommend message and channel
app.post('/campaigns/generate-preview', async (req: Request, res: Response) => {
  try {
    const { goal, audienceDescription } = req.body;

    if (!goal || !audienceDescription) {
      res.status(400).json({ error: 'Missing goal or audienceDescription' });
      return;
    }

    const campaignPreview = await generateCampaign(goal, audienceDescription);
    res.json(campaignPreview);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`CRM Backend Server running on http://localhost:${PORT}`);
});
