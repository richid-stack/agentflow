// api/agent-trigger.js — Vercel Serverless Function
// Called when an agent completes a task — sends real WhatsApp notification
// Agents: Rex (appointments), Finn (invoices), Nova (leads), Aria (support)

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { agentName, triggerType, data, notifyNumber } = req.body;

  // notifyNumber = the business owner's WhatsApp number to notify
  if (!agentName || !triggerType || !notifyNumber) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken  = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || "+14155238886";

  // ── Build message based on agent and trigger type ──
  let message = "";

  switch (`${agentName}:${triggerType}`) {

    // REX — Appointment Booking
    case "Rex:appointment_booked":
      message = `📅 Rex here — new appointment booked!\n\nClient: ${data.clientName || "Unknown"}\nDate: ${data.date || "TBD"}\nTime: ${data.time || "TBD"}\nService: ${data.service || "General"}\n\nSMS reminder will be sent 24h before.`;
      break;

    case "Rex:appointment_reminder":
      message = `⏰ Rex reminder — appointment tomorrow!\n\nClient: ${data.clientName || "Unknown"}\nTime: ${data.time || "TBD"}\nService: ${data.service || "General"}\n\nClient has been notified via SMS.`;
      break;

    // FINN — Invoicing
    case "Finn:invoice_sent":
      message = `🧾 Finn here — invoice sent!\n\nClient: ${data.clientName || "Unknown"}\nAmount: ${data.amount || "N/A"}\nInvoice #: ${data.invoiceNumber || "N/A"}\nDue: ${data.dueDate || "30 days"}\n\nI'll follow up if unpaid.`;
      break;

    case "Finn:payment_overdue":
      message = `⚠️ Finn alert — overdue payment!\n\nClient: ${data.clientName || "Unknown"}\nAmount: ${data.amount || "N/A"}\nOverdue by: ${data.daysOverdue || "3"} days\n\nReminder sent to client. Reply ESCALATE to flag for manual follow-up.`;
      break;

    // NOVA — Lead Capture
    case "Nova:lead_captured":
      message = `🎯 Nova here — new lead captured!\n\nName: ${data.leadName || "Unknown"}\nSource: ${data.source || "Website"}\nIntent Score: ${data.score || "N/A"}/100\nContact: ${data.contact || "N/A"}\n\n${data.score >= 70 ? "🔥 HIGH INTENT — follow up fast!" : "Added to pipeline for nurturing."}`;
      break;

    case "Nova:lead_qualified":
      message = `✅ Nova — lead qualified!\n\n${data.leadName || "New lead"} scored ${data.score || "N/A"}/100\nBusiness: ${data.business || "Unknown"}\n\nReady for your sales call. Reply ASSIGN to claim this lead.`;
      break;

    // ARIA — Customer Support
    case "Aria:escalation":
      message = `🚨 Aria escalation — needs your attention!\n\nCustomer: ${data.customerName || "Unknown"}\nIssue: ${data.issue || "Not specified"}\nTicket: ${data.ticketId || "N/A"}\n\nAria couldn't resolve this automatically. Please follow up directly.`;
      break;

    case "Aria:ticket_resolved":
      message = `✅ Aria resolved a ticket!\n\nCustomer: ${data.customerName || "Unknown"}\nIssue: ${data.issue || "N/A"}\nResolution: ${data.resolution || "Handled automatically"}\n\nNo action needed from you.`;
      break;

    default:
      message = `🤖 AgentFlow update from ${agentName}!\n\nTrigger: ${triggerType}\n${data.note || "Task completed successfully."}`;
  }

  // ── Send via Twilio WhatsApp ──
  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    const msgBody = new URLSearchParams({
      From: `whatsapp:${fromNumber}`,
      To:   `whatsapp:${notifyNumber}`,
      Body: message,
    });

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: msgBody.toString(),
      }
    );

    const twilioData = await twilioRes.json();

    if (!twilioRes.ok) {
      console.error("Twilio error:", twilioData);
      return res.status(400).json({ error: twilioData.message });
    }

    console.log(`✅ ${agentName} triggered: ${triggerType} → notified ${notifyNumber}`);
    return res.status(200).json({ success: true, sid: twilioData.sid });

  } catch (err) {
    console.error("Agent trigger error:", err);
    return res.status(500).json({ error: "Failed to send notification" });
  }
}
