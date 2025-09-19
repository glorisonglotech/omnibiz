import { Quote, Star as StarIcon } from "lucide-react";
import {
  Users,
  Server,
  Headset,
  Star as RatingStar,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Chebet",
    role: "Restaurant Owner",
    company: "Green Leaf Bistro",
    content:
      "BizHub transformed how we manage our restaurant. From inventory tracking to appointment reservations, everything is seamless. Our efficiency increased by 40%!",
    rating: 5,
    avatar: "SJ",
  },
  {
    name: "Mike Simiyu",
    role: "Retail Manager",
    company: "Tech Gadgets Plus",
    content:
      "The e-commerce integration is incredible. We went from manual order processing to complete automation. Our online sales doubled in just 3 months.",
    rating: 5,
    avatar: "MC",
  },
  {
    name: "Emily Wangoi",
    role: "Salon Owner",
    company: "Bella Beauty Studio",
    content:
      "The appointment scheduling feature is a game-changer. Clients love the automatic reminders, and we've reduced no-shows by 60%. Highly recommended!",
    rating: 5,
    avatar: "ER",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-16 lg:py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold text-foreground mb-6">
            Trusted by Business Owners
            <span className="text-green-500 block">Across Industries</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            See how BizHub is helping businesses streamline operations and
            accelerate growth.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.name}
              className="relative group hover:shadow-md transition-all duration-200"
            >
              <div className="absolute -top-3 -left-3 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                <Quote className="h-4 w-4 text-green-700" />
              </div>

              <CardContent className="space-y-4 pt-6">
                <div className="flex items-center space-x-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-foreground leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3 pt-4 border-t border-border">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {testimonial.avatar}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}, {testimonial.company}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center space-y-1">
              <Users className="h-6 w-6 text-green-500" />
              <div className="text-3xl font-bold text-green-500">10,000+</div>
            </div>
            <div className="text-muted-foreground">Active Users</div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center space-y-1">
              <Server className="h-6 w-6 text-green-500" />
              <div className="text-3xl font-bold text-green-500">99.9%</div>
            </div>
            <div className="text-muted-foreground">Uptime</div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center space-y-1">
              <Headset className="h-6 w-6 text-green-500" />
              <div className="text-3xl font-bold text-green-500">24/7</div>
            </div>
            <div className="text-muted-foreground">Support</div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col items-center justify-center space-y-1">
              <RatingStar className="h-6 w-6 text-green-500 fill-green-500" />
              <div className="text-3xl font-bold text-green-500">4.9/5</div>
            </div>
            <div className="text-muted-foreground">User Rating</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
