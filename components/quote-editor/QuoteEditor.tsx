'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuoteDesign, Quote, QuoteStyle, BackgroundStyle, CanvasSize } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { HexColorPicker } from 'react-colorful';
// import { Download, Share2 } from "lucide-react";
// import { toast } from 'sonner';

interface QuoteEditorProps {
  design: QuoteDesign;
  onDesignChange: (design: Partial<QuoteDesign>) => void;
}

export function QuoteEditor({ design, onDesignChange }: QuoteEditorProps) {
  const [activeTab, setActiveTab] = useState('content');
  const [colorPickerVisible, setColorPickerVisible] = useState(false);

  const handleQuoteChange = (quote: Partial<Quote>) => {
    onDesignChange({
      quote: {
        ...design.quote,
        ...quote,
      },
    });
  };

  const handleQuoteStyleChange = (style: Partial<QuoteStyle>) => {
    onDesignChange({
      quoteStyle: {
        ...design.quoteStyle,
        ...style,
      },
    });
  };

  const handleBackgroundChange = (background: Partial<BackgroundStyle>) => {
    onDesignChange({
      background: {
        ...design.background,
        ...background,
      },
    });
  };

  const handleSizeChange = (size: Partial<CanvasSize>) => {
    onDesignChange({
      size: {
        ...design.size,
        ...size,
      },
    });
  };

  // const downloadImage = () => {
  //   // Implementation will be added later with html2canvas
  //   toast.success('Image downloaded successfully');
  // };

  // const shareImage = () => {
  //   // Implementation will be added later
  //   toast.success('Sharing link copied to clipboard');
  // };

  const canvasSizes = [
    { name: 'Instagram Post', width: 1080, height: 1080, aspectRatio: '1:1' },
    { name: 'Instagram Story', width: 1080, height: 1920, aspectRatio: '9:16' },
    { name: 'Twitter Post', width: 1200, height: 675, aspectRatio: '16:9' },
    { name: 'Facebook Post', width: 1200, height: 630, aspectRatio: '1.91:1' },
    { name: 'Pinterest Pin', width: 1000, height: 1500, aspectRatio: '2:3' },
  ];

  const fontOptions = [
    'Inter',
    'Roboto',
    'Montserrat',
    'Playfair Display',
    'Merriweather',
    'Oswald',
    'Lato',
    'Open Sans',
    'Poppins',
    'Raleway',
  ];

  const gradients = [
    'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
    'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 100%)',
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Quote Editor</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
            <TabsTrigger value="background">Background</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quote-text">Quote Text</Label>
              <Textarea
                id="quote-text"
                placeholder="Enter your quote here..."
                value={design.quote.text}
                onChange={(e) => handleQuoteChange({ text: e.target.value })}
                className="min-h-[120px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="author">Author (Optional)</Label>
              <Input
                id="author"
                placeholder="Author name"
                value={design.quote.author || ''}
                onChange={(e) => handleQuoteChange({ author: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="canvas-size">Canvas Size</Label>
              <Select
                value={design.size.aspectRatio}
                onValueChange={(value) => {
                  const selectedSize = canvasSizes.find((size) => size.aspectRatio === value);
                  if (selectedSize) {
                    handleSizeChange(selectedSize);
                  }
                }}
              >
                <SelectTrigger id="canvas-size">
                  <SelectValue placeholder="Select canvas size" />
                </SelectTrigger>
                <SelectContent>
                  {canvasSizes.map((size) => (
                    <SelectItem key={size.name} value={size.aspectRatio}>
                      {size.name} ({size.width}x{size.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="padding">Padding</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="padding"
                  min={10}
                  max={100}
                  step={1}
                  value={[design.padding]}
                  onValueChange={(values) => onDesignChange({ padding: values[0] })}
                />
                <span className="w-12 text-center">{design.padding}px</span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="font">Font</Label>
              <Select
                value={design.quoteStyle.font}
                onValueChange={(value) => handleQuoteStyleChange({ font: value })}
              >
                <SelectTrigger id="font">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  {fontOptions.map((font) => (
                    <SelectItem key={font} value={font}>
                      {font}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="font-size">Font Size</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="font-size"
                  min={12}
                  max={72}
                  step={1}
                  value={[design.quoteStyle.fontSize]}
                  onValueChange={(values) => handleQuoteStyleChange({ fontSize: values[0] })}
                />
                <span className="w-12 text-center">{design.quoteStyle.fontSize}px</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="line-height">Line Height</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="line-height"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[design.quoteStyle.lineHeight]}
                  onValueChange={(values) => handleQuoteStyleChange({ lineHeight: values[0] })}
                />
                <span className="w-12 text-center">{design.quoteStyle.lineHeight.toFixed(1)}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alignment">Text Alignment</Label>
              <Select
                value={design.quoteStyle.alignment}
                onValueChange={(value) =>
                  handleQuoteStyleChange({
                    alignment: value as 'left' | 'center' | 'right',
                  })
                }
              >
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="text-color">Text Color</Label>
              <div className="flex items-center space-x-2">
                <div
                  className="w-10 h-10 rounded-md cursor-pointer border"
                  style={{ backgroundColor: design.quoteStyle.color }}
                  onClick={() => setColorPickerVisible(!colorPickerVisible)}
                />
                <Input
                  id="text-color"
                  value={design.quoteStyle.color}
                  onChange={(e) => handleQuoteStyleChange({ color: e.target.value })}
                />
              </div>
              {colorPickerVisible && (
                <div className="absolute z-10 mt-2">
                  <HexColorPicker
                    color={design.quoteStyle.color}
                    onChange={(color) => handleQuoteStyleChange({ color })}
                  />
                  <div className="flex justify-end mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setColorPickerVisible(false)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="background" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="background-type">Background Type</Label>
              <Select
                value={design.background.type}
                onValueChange={(value) =>
                  handleBackgroundChange({
                    type: value as 'color' | 'gradient' | 'image',
                  })
                }
              >
                <SelectTrigger id="background-type">
                  <SelectValue placeholder="Select background type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="color">Solid Color</SelectItem>
                  <SelectItem value="gradient">Gradient</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {design.background.type === 'color' && (
              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex items-center space-x-2">
                  <div
                    className="w-10 h-10 rounded-md cursor-pointer border"
                    style={{ backgroundColor: design.background.value }}
                    onClick={() => setColorPickerVisible(!colorPickerVisible)}
                  />
                  <Input
                    id="background-color"
                    value={design.background.value}
                    onChange={(e) => handleBackgroundChange({ value: e.target.value })}
                  />
                </div>
                {colorPickerVisible && (
                  <div className="absolute z-10 mt-2">
                    <HexColorPicker
                      color={design.background.value}
                      onChange={(color) => handleBackgroundChange({ value: color })}
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setColorPickerVisible(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {design.background.type === 'gradient' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Gradient Presets</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {gradients.map((gradient, index) => (
                      <div
                        key={index}
                        className="w-full h-12 rounded-md cursor-pointer border"
                        style={{ background: gradient }}
                        onClick={() => handleBackgroundChange({ value: gradient })}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom-gradient">Custom Gradient</Label>
                  <Input
                    id="custom-gradient"
                    value={design.background.value}
                    onChange={(e) => handleBackgroundChange({ value: e.target.value })}
                    placeholder="linear-gradient(...)"
                  />
                </div>
              </div>
            )}

            {design.background.type === 'image' && (
              <div className="space-y-2">
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={design.background.value}
                  onChange={(e) => handleBackgroundChange({ value: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="opacity">Opacity</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="opacity"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={[design.background.opacity || 1]}
                  onValueChange={(values) => handleBackgroundChange({ opacity: values[0] })}
                />
                <span className="w-12 text-center">
                  {(design.background.opacity || 1).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="blur">Blur</Label>
              <div className="flex items-center space-x-2">
                <Slider
                  id="blur"
                  min={0}
                  max={20}
                  step={1}
                  value={[design.background.blur || 0]}
                  onValueChange={(values) => handleBackgroundChange({ blur: values[0] })}
                />
                <span className="w-12 text-center">{design.background.blur || 0}px</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
