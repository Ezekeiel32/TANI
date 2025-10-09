import { Separator } from "../ui/separator";

export default function ConnectSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-headline font-bold text-primary">
            Connect With Us
          </h2>
        </div>
        <Separator className="my-12 max-w-4xl mx-auto" />
        <div className="mt-16 bg-muted rounded-lg h-96 flex items-center justify-center">
          <p className="text-muted-foreground text-lg">Instagram Feed Placeholder</p>
        </div>
      </div>
    </section>
  );
}
