import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: string;
  features: string[];
  highlighted?: boolean;
  className?: string;
}

export function PricingCard(props: Readonly<PricingCardProps>) {
  const { title, price, features, highlighted = false, className = "" } = props;

  return (
    <div
      className={`bg-white p-4 rounded-lg shadow-md flex-1 ${
        highlighted ? "border-2 border-blue-500 relative" : ""
      } ${className}`}
    >
      {highlighted && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
          Most Popular
        </div>
      )}
      <h3 className="text-xl font-bold mb-3 text-center">{title}</h3>
      <p className="text-lg font-bold text-center mb-4">
        {price + " "}
        <span className="text-lg text-gray-500">/ month</span>
      </p>
      <ul className="space-y-2 mb-4 text-lg">
        {features.map((feature) => (
          <li key={feature} className="flex items-center">
            <Check className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
