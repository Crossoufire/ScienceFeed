import {Rss, Search, User} from "lucide-react";


const features = [
    {
        icon: <Rss className="h-8 w-8 text-blue-500"/>,
        title: "RSS Integration",
        description: "Add your favorite science RSS feeds to your profile"
    },
    {
        icon: <Search className="h-8 w-8 text-blue-500"/>,
        title: "Keyword Filtering",
        description: "Specify keywords to filter articles that interest you"
    },
    {
        icon: <User className="h-8 w-8 text-blue-500"/>,
        title: "Personalized Feed",
        description: "Get a curated feed of science articles tailored to your interests"
    }
];


export const Features = () => (
    <section className="bg-gray-800 rounded-xl">
        <div className="px-8 py-4 pb-8">
            <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {features.map((feature, idx) =>
                    <div key={idx} className="text-center">
                        <div className="mb-2 flex justify-center">{feature.icon}</div>
                        <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                        <p className="text-gray-400 text-center">{feature.description}</p>
                    </div>
                )}
            </div>
        </div>
    </section>
);
