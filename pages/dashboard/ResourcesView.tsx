import React from 'react';
import { Icon } from '../../components/ui';

const resources = [
    {
        title: "Department of Agriculture",
        description: "Official portal for agricultural programs, news, and regulations in the Philippines.",
        link: "https://www.da.gov.ph/",
        icon: "Globe" as const
    },
    {
        title: "Bureau of Animal Industry",
        description: "Guidelines on animal health, disease prevention, and biosecurity measures.",
        link: "https://www.bai.gov.ph/",
        icon: "ShieldCheck" as const
    },
    {
        title: "ATI e-Extension",
        description: "Online courses and resources for farmers from the Agricultural Training Institute.",
        link: "https://e-extension.gov.ph/",
        icon: "BookOpen" as const
    },
    {
        title: "Poultry Farming Best Practices",
        description: "A comprehensive guide on layer management, feeding, and housing.",
        link: "https://thepoultrysite.com/articles/management-of-the-laying-flock",
        icon: "Feather" as const
    },
    {
        title: "Egg Market Price Monitoring",
        description: "Check the latest farmgate and retail prices for eggs across different regions.",
        link: "https://www.da.gov.ph/price-monitoring/",
        icon: "TrendingUp" as const
    },
     {
        title: "LCE Community Guidelines",
        description: "Rules and best practices for members of the Legal Chicks Empowerment Network.",
        link: "#",
        icon: "Users" as const
    }
];

const ResourceCard: React.FC<typeof resources[0]> = ({ title, description, link, icon }) => (
    <a href={link} target="_blank" rel="noopener noreferrer" className="block bg-[--color-card] p-6 rounded-lg shadow-sm border border-[--color-border] hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
        <div className="flex items-center space-x-4 mb-3">
            <div className="bg-[--color-accent-light] p-3 rounded-full">
                <Icon name={icon} className="w-6 h-6 text-[--color-primary]" />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">{title}</h3>
        </div>
        <p className="text-[--color-text-secondary] mb-4">{description}</p>
        <span className="font-semibold text-amber-600 group-hover:text-amber-700 text-sm">Visit Resource &rarr;</span>
    </a>
);

const ResourcesView = () => {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Resources & Learning</h1>
            <p className="text-lg text-[--color-text-secondary]">Curated links and documents to help you grow your farm and business.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map(resource => (
                    <ResourceCard key={resource.title} {...resource} />
                ))}
            </div>
        </div>
    );
};

export default ResourcesView;