import express, { Request, Response } from "express";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatAnthropic } from "@langchain/anthropic";
import cors from "cors";
import { config } from "dotenv";

config();

const app = express();

const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(
  cors({
    origin: [process.env.FRONTEND_URL || "https://master--vacation-ai.netlify.app/"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.post("/ai/ask", async (req: Request, res: Response) => {
  try {
    const { destination, reason, startDate, endDate } = req.body;

    const model = new ChatAnthropic({
      temperature: 0,
      model: "claude-3-sonnet-20240229",
      apiKey: process.env.ANTHROPIC_API_KEY,
      maxTokens: 1024,
    });

    const prompt = ChatPromptTemplate.fromTemplate(
      `Plan a {reason} vacation itinerary for me from {startDate} to {endDate} in {destination}. Include popular places to visit and activities to do. You must give the response in a structured format so that the plan is visually understandable. If someone gives an invalid destination which is not there then you'll simply say "I'm not getting the valid destination to design a vacation."
    
    Note: Use markdown in response, if needed.`
    );

    const chain = prompt.pipe(model);

    const response = await chain.invoke({
      destination,
      endDate,
      reason,
      startDate,
    });

    res.status(200).json({
      success: true,
      vacation: response.content,
    });
  } catch (error) {
    console.log(error);
  }
});

app.listen(PORT, () => console.log("Your server is working on port:" + PORT));
