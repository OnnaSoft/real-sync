import FeatureCard from "./FeatureCard";

interface UsageCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export default function UsageCard(props: Readonly<UsageCardProps>) {
    return <FeatureCard {...props} />;
}
