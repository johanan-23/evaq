"use client";

import { CameraFeed } from "@/components/camera/camera-feed";
import { AIInspectionCard } from "@/components/inspection/ai-inspection-card";
import { FinalDecisionCard } from "@/components/inspection/final-decision-card";
import { ProductCard } from "@/components/inspection/product-card";

export function CurrentInspection() {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-12">
      <div className="md:col-span-2 xl:col-span-8">
        <CameraFeed compact />
      </div>
      <div className="xl:col-span-4">
        <FinalDecisionCard />
      </div>
      <div className="xl:col-span-6">
        <ProductCard />
      </div>
      <div className="xl:col-span-6">
        <AIInspectionCard />
      </div>
    </div>
  );
}
