import { Slider } from "@/components/ui/slider";

export function SliderDemo() {
  return (
    <div className="w-full max-w-sm space-y-4">
      {/* Basic slider */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium leading-none">Basic Slider</h4>
        <Slider defaultValue={[50]} max={100} step={1} />
      </div>

      {/* Range slider */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium leading-none">Range Slider</h4>
        <Slider defaultValue={[25, 75]} max={100} step={1} />
      </div>

      {/* Disabled slider */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium leading-none">Disabled Slider</h4>
        <Slider defaultValue={[50]} max={100} step={1} disabled />
      </div>
    </div>
  );
} 