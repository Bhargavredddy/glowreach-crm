import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const CRM_CALLBACK_URL = process.env.CRM_CALLBACK_URL || 'http://localhost:5000/receipts';

interface SendRequest {
  campaignId: string;
  customerId: string;
  channel: 'WhatsApp' | 'Email';
  message: string;
  communicationId: string;
}

// In-memory log of simulation events
const simulationLogs: Array<{
  timestamp: string;
  communicationId: string;
  channel: string;
  status: string;
  details: string;
}> = [];

function logSimulationEvent(communicationId: string, channel: string, status: string, details: string) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    communicationId,
    channel,
    status,
    details
  };
  simulationLogs.push(logEntry);
  if (simulationLogs.length > 200) {
    simulationLogs.shift();
  }
  console.log(`[Simulator] ${logEntry.timestamp} | Comm: ${communicationId} | Channel: ${channel} | Status: ${status} | ${details}`);
}

async function sendReceiptCallback(communicationId: string, status: string) {
  try {
    await axios.post(CRM_CALLBACK_URL, {
      communicationId,
      status
    });
    logSimulationEvent(communicationId, 'Callback', 'SUCCESS', `Dispatched callback: status=${status} to CRM.`);
  } catch (error: any) {
    logSimulationEvent(communicationId, 'Callback', 'ERROR', `Failed to send callback (${CRM_CALLBACK_URL}): ${error.message}`);
  }
}

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'healthy', service: 'Stub Channel Service' });
});

app.get('/logs', (req: Request, res: Response) => {
  res.json(simulationLogs);
});

app.post('/send', (req: Request<{}, {}, SendRequest>, res: Response) => {
  const { campaignId, customerId, channel, message, communicationId } = req.body;

  if (!campaignId || !customerId || !channel || !message || !communicationId) {
    res.status(400).json({ error: 'Missing required parameters' });
    return;
  }

  logSimulationEvent(communicationId, channel, 'ACCEPTED', `Message request queued for customer ${customerId}`);

  // Send immediate 202 Accepted response to the CRM backend
  res.status(202).json({
    status: 'accepted',
    message: 'Simulation initiated',
    communicationId
  });

  // Calculate probabilities
  const isSuccess = Math.random() >= 0.05; // 95% Delivered, 5% Failed
  const isOpen = Math.random() <= 0.70;    // 70% Opened
  const isClick = Math.random() <= 0.25;   // 25% Clicked

  // 1. Deliver or Fail at 2 seconds
  setTimeout(() => {
    if (!isSuccess) {
      logSimulationEvent(communicationId, channel, 'FAILED', `Delivery failed for customer ${customerId}`);
      sendReceiptCallback(communicationId, 'failed');
    } else {
      logSimulationEvent(communicationId, channel, 'DELIVERED', `Delivered to customer ${customerId}`);
      sendReceiptCallback(communicationId, 'delivered');

      // 2. Open at 5 seconds (relative to start)
      if (isOpen) {
        setTimeout(() => {
          logSimulationEvent(communicationId, channel, 'OPENED', `Opened by customer ${customerId}`);
          sendReceiptCallback(communicationId, 'opened');

          // 3. Click at 8 seconds (relative to start, i.e., 3 seconds after open)
          if (isClick) {
            setTimeout(() => {
              logSimulationEvent(communicationId, channel, 'CLICKED', `Link clicked by customer ${customerId}`);
              sendReceiptCallback(communicationId, 'clicked');
            }, 3000); // 8 seconds total from start (2s + 3s + 3s = 8s)
          }
        }, 3000); // 5 seconds total from start (2s + 3s = 5s)
      }
    }
  }, 2000);
});

app.listen(PORT, () => {
  console.log(`Stub Channel Service is running on http://localhost:${PORT}`);
  console.log(`Callbacks will be sent to CRM at: ${CRM_CALLBACK_URL}`);
});
