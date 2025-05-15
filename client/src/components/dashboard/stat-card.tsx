import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  bgColor: string; // tailwind bg color class
  linkText?: string;
  linkHref?: string;
}

export function StatCard({ title, value, icon: Icon, bgColor, linkText = "View all", linkHref = "#" }: StatCardProps) {
  return (
    <Card>
      <CardContent className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${bgColor} rounded-md p-3`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="ml-5">
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">{value}</dd>
          </div>
        </div>
      </CardContent>
      <CardFooter className="bg-gray-50 px-4 py-4 sm:px-6">
        <div className="text-sm">
          <a href={linkHref} className="font-medium text-indigo-600 hover:text-indigo-500">
            {linkText}<span className="sr-only"> {title.toLowerCase()}</span>
          </a>
        </div>
      </CardFooter>
    </Card>
  );
}
