import { Card, CardContent } from "@/components/ui/card";

export default function GhibliExamples() {
  const examples = [
    {
      id: 1,
      title: "Nature Scene",
      description: "Ghibli-style landscape with vibrant colors",
      imageUrl: "https://cdn.midjourney.com/0f178262-e1ef-4e42-9eca-14d168d1ad77/0_0.webp"
    },
    {
      id: 2,
      title: "Character Portrait",
      description: "Whimsical character in Ghibli style",
      imageUrl: "https://cdn.midjourney.com/aa5da68d-76b0-4f8f-a3bd-d4e08150b954/0_2.webp"
    },
    {
      id: 3,
      title: "Cityscape",
      description: "Detailed urban scene with Ghibli touches",
      imageUrl: "https://cdn.midjourney.com/f77c38b6-23a0-46e1-a5a1-8a0f8c5ff02b/0_0.webp"
    },
    {
      id: 4,
      title: "Fantasy Scene",
      description: "Magical elements with dream-like quality",
      imageUrl: "https://cdn.midjourney.com/0acd2b64-87c5-46af-a1d5-6e0d9f220be1/0_1.webp"
    }
  ];

  return (
    <div className="mt-12">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Studio Ghibli Style Examples</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {examples.map((example) => (
          <Card key={example.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="aspect-w-4 aspect-h-3 relative bg-gray-100">
              <img 
                src={example.imageUrl}
                alt={`Ghibli style example - ${example.title}`}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-gray-800">{example.title}</h3>
              <p className="text-sm text-gray-500">{example.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
