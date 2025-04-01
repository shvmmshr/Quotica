import React, { useState } from "react";
import { ImageModelOption, IMAGE_MODEL_OPTIONS } from "../types";
import { getUserCredits } from "@/lib/mockApi";

interface ImageGeneratorProps {
  userId: string;
  onGenerate: (prompt: string, model: ImageModelOption) => Promise<void>;
  onCancel: () => void;
}

const ImageGenerator: React.FC<ImageGeneratorProps> = ({
  userId,
  onGenerate,
  onCancel,
}) => {
  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModelOption>(
    IMAGE_MODEL_OPTIONS[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const userCredits = getUserCredits(userId);
  const availableCredits = userCredits.total - userCredits.used;

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    try {
      await onGenerate(prompt, selectedModel);
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
      onCancel(); // Close the dialog after generation
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-xl w-full p-6 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Generate Image</h2>

        <div className="mb-4">
          <div className="flex justify-between font-medium text-sm mb-1">
            <span>Available Credits:</span>
            <span
              className={
                availableCredits < 1 ? "text-red-500" : "text-green-500"
              }
            >
              {availableCredits.toFixed(2)} credits
            </span>
          </div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 h-32"
          />
        </div>

        <div className="mb-6">
          <h3 className="font-medium mb-2">Select Model</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {IMAGE_MODEL_OPTIONS.map((model) => (
              <div
                key={model.id}
                className={`border rounded-md p-3 cursor-pointer ${
                  selectedModel.id === model.id
                    ? "border-blue-500 ring-2 ring-blue-500 bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setSelectedModel(model)}
              >
                <div className="font-medium">{model.name}</div>
                <div className="text-sm text-gray-600 mb-1">
                  {model.description}
                </div>
                <div className="text-sm font-medium">
                  Cost:{" "}
                  <span className="text-amber-600">
                    {model.creditCost} credits
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={
              !prompt.trim() ||
              isGenerating ||
              availableCredits < selectedModel.creditCost
            }
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate Image"}
          </button>
        </div>

        {availableCredits < selectedModel.creditCost && (
          <div className="mt-2 text-sm text-red-500">
            Not enough credits. Please recharge your credits from the membership
            page.
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGenerator;
