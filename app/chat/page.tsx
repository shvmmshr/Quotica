"use client";
import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { ImageModelOption, IMAGE_MODEL_OPTIONS } from "./types";
import { getUserCredits, initUserCredits, generateImage } from "@/lib/mockApi";
import {
  ImageIcon,
  Send,
  Upload,
  CreditCard,
  Sun,
  Moon,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";

export default function ImageStudioPage() {
  const { user, isLoaded } = useUser();
  const userId = user?.id || "guest";
  const { theme, setTheme } = useTheme();

  const [prompt, setPrompt] = useState("");
  const [selectedModel, setSelectedModel] = useState<ImageModelOption>(
    IMAGE_MODEL_OPTIONS[0]
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [history, setHistory] = useState<
    { prompt: string; imageUrl: string; model: ImageModelOption }[]
  >([]);

  // Initialize user credits
  useEffect(() => {
    if (userId) {
      initUserCredits(userId, 50); // Start with 50 credits for testing
    }
  }, [userId]);

  const userCredits = getUserCredits(userId);
  const availableCredits = userCredits.total - userCredits.used;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedImage(reader.result as string);
        setIsEditMode(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);

    try {
      // Create a temporary chat ID for the image generation
      const chatId = `temp-${Date.now()}`;

      // Generate the image
      const result = await generateImage(chatId, userId, prompt, selectedModel);

      if (result && result.imageUrl) {
        setGeneratedImage(result.imageUrl);
        setHistory((prev) => [
          ...prev,
          {
            prompt,
            imageUrl: result.imageUrl || "",
            model: selectedModel,
          },
        ]);
      }
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const clearAll = () => {
    setPrompt("");
    setUploadedImage(null);
    setGeneratedImage(null);
    setIsEditMode(false);
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col h-screen ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header with theme toggle and credits */}
      <div
        className={`p-4 flex justify-between items-center border-b ${
          theme === "dark" ? "border-gray-800" : "border-gray-200"
        }`}
      >
        <h1 className="text-xl font-bold">Quotify Image Creator</h1>
        <div className="flex items-center gap-4">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full ${
              theme === "dark" ? "bg-gray-800" : "bg-white border"
            }`}
          >
            <span className="text-sm font-medium">Credits:</span>
            <span
              className={`text-sm font-bold ${
                availableCredits < 1 ? "text-red-500" : "text-green-500"
              }`}
            >
              {availableCredits.toFixed(2)}
            </span>
          </div>
          <Link href="/membership">
            <button
              className={`flex items-center gap-1 px-3 py-1.5 rounded-md ${
                theme === "dark"
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-blue-500 hover:bg-blue-600"
              } text-white`}
            >
              <CreditCard size={16} />
              <span className="text-sm">Add Credits</span>
            </button>
          </Link>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={`p-2 rounded-full ${
              theme === "dark"
                ? "bg-gray-800 hover:bg-gray-700"
                : "bg-white hover:bg-gray-100 border"
            }`}
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar with model selection */}
        <div
          className={`w-80 border-r ${
            theme === "dark"
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          } overflow-y-auto`}
        >
          <div className="p-4">
            <h2 className="font-medium mb-4">Select Model</h2>
            <div className="space-y-2">
              {IMAGE_MODEL_OPTIONS.map((model) => (
                <div
                  key={model.id}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    selectedModel.id === model.id
                      ? theme === "dark"
                        ? "bg-blue-900 border-blue-700 ring-1 ring-blue-600"
                        : "bg-blue-50 border-blue-300 ring-1 ring-blue-400"
                      : theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600 border border-gray-600"
                      : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                  }`}
                  onClick={() => setSelectedModel(model)}
                >
                  <div className="font-medium">{model.name}</div>
                  <div
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-300" : "text-gray-600"
                    } mb-1`}
                  >
                    {model.description}
                  </div>
                  <div className="text-sm">
                    Cost:{" "}
                    <span className="text-amber-500 font-medium">
                      {model.creditCost} credits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {history.length > 0 && (
            <div
              className={`mt-6 p-4 border-t ${
                theme === "dark" ? "border-gray-700" : "border-gray-200"
              }`}
            >
              <h2 className="font-medium mb-4">Recent Generations</h2>
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-lg cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-50 hover:bg-gray-100"
                    }`}
                    onClick={() => {
                      setGeneratedImage(item.imageUrl);
                      setPrompt(item.prompt);
                      setSelectedModel(item.model);
                    }}
                  >
                    <div className="rounded-md overflow-hidden mb-2 h-24 bg-gray-200">
                      <img
                        src={item.imageUrl}
                        alt="History image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div
                      className={`text-xs truncate ${
                        theme === "dark" ? "text-gray-300" : "text-gray-600"
                      }`}
                    >
                      {item.prompt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col">
          {/* Image display area */}
          <div className="flex-1 flex items-center justify-center overflow-y-auto p-6">
            {isEditMode && uploadedImage ? (
              <div className="text-center">
                <div className="relative inline-block group">
                  <img
                    src={uploadedImage}
                    alt="Uploaded image"
                    className={`max-h-[70vh] max-w-full rounded-lg shadow-lg ${
                      theme === "dark"
                        ? "border border-gray-700"
                        : "border border-gray-200"
                    }`}
                  />
                  <button
                    onClick={() => setUploadedImage(null)}
                    className={`absolute top-2 right-2 p-2 rounded-full ${
                      theme === "dark"
                        ? "bg-gray-800 hover:bg-gray-700"
                        : "bg-white hover:bg-gray-100"
                    } opacity-80 hover:opacity-100`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p
                  className={`mt-4 text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Enter a prompt below to edit this image
                </p>
              </div>
            ) : generatedImage ? (
              <div className="text-center">
                <div className="relative inline-block">
                  <img
                    src={generatedImage}
                    alt="Generated image"
                    className={`max-h-[70vh] max-w-full rounded-lg shadow-lg ${
                      theme === "dark"
                        ? "border border-gray-700"
                        : "border border-gray-200"
                    }`}
                  />
                </div>
                <p
                  className={`mt-4 text-sm ${
                    theme === "dark" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  "{prompt}"
                </p>
              </div>
            ) : (
              <div
                className={`text-center p-8 rounded-xl ${
                  theme === "dark"
                    ? "bg-gray-800"
                    : "bg-white border border-gray-200"
                } max-w-md`}
              >
                <ImageIcon
                  size={48}
                  className={`mx-auto mb-4 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <h2 className="text-xl font-bold mb-2">
                  Create or Edit Images
                </h2>
                <p
                  className={`mb-6 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-600"
                  }`}
                >
                  Type a prompt below to generate a new image or upload an image
                  to edit it.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <label
                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg cursor-pointer ${
                      theme === "dark"
                        ? "bg-gray-700 hover:bg-gray-600"
                        : "bg-gray-100 hover:bg-gray-200"
                    }`}
                  >
                    <Upload size={18} />
                    <span>Upload Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Prompt input area */}
          <div
            className={`p-4 ${
              theme === "dark"
                ? "bg-gray-800 border-t border-gray-700"
                : "bg-white border-t border-gray-200"
            }`}
          >
            <div className="flex items-start gap-2 max-w-3xl mx-auto">
              {(isEditMode || generatedImage) && (
                <button
                  onClick={clearAll}
                  className={`p-3 rounded-lg ${
                    theme === "dark"
                      ? "bg-gray-700 hover:bg-gray-600"
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
                  title="Start over"
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              <div className="flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={
                    isEditMode
                      ? "Describe how to edit this image..."
                      : "Describe the image you want to generate..."
                  }
                  className={`w-full p-3 rounded-lg resize-none ${
                    theme === "dark"
                      ? "bg-gray-700 text-white border-gray-600 focus:border-blue-500"
                      : "bg-white border border-gray-300 focus:border-blue-400"
                  } focus:ring-2 focus:ring-blue-500 h-20`}
                />

                <div className="flex justify-between items-center mt-2 text-xs">
                  <div
                    className={
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    }
                  >
                    {isEditMode ? "Editing with" : "Generating with"}:{" "}
                    <span className="font-medium">{selectedModel.name}</span>
                  </div>
                  <div
                    className={`${
                      availableCredits < selectedModel.creditCost
                        ? "text-red-500"
                        : theme === "dark"
                        ? "text-gray-400"
                        : "text-gray-500"
                    }`}
                  >
                    Cost: {selectedModel.creditCost} credits
                  </div>
                </div>
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={
                  !prompt.trim() ||
                  isGenerating ||
                  availableCredits < selectedModel.creditCost
                }
                className={`p-3 rounded-lg ${
                  !prompt.trim() ||
                  isGenerating ||
                  availableCredits < selectedModel.creditCost
                    ? theme === "dark"
                      ? "bg-gray-700 text-gray-500"
                      : "bg-gray-100 text-gray-400"
                    : theme === "dark"
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {isGenerating ? "..." : <Send size={20} />}
              </button>
            </div>

            {availableCredits < selectedModel.creditCost && (
              <div className="text-center mt-2 text-red-500 text-sm">
                Not enough credits. Please purchase more credits from the
                membership page.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
