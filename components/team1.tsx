import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
}

interface Team1Props {
  heading?: string;
  subheading?: string;
  description?: string;
  members?: TeamMember[];
  className?: string;
}

const Team1 = ({
  heading = "Meet Our Team",
  description = "The passionate minds behind Career Guide, dedicated to helping you find your perfect career path.",
  members = [
    {
      id: "member-1",
      name: "Yohannes Tesfaye",
      role: "Co-Founder & Developer",
      avatar: "/team/team-yohannes-tesfaye.jpg",
    },
    {
      id: "member-2",
      name: "Zelalem",
      role: "Co-Founder & Developer",
      avatar: "/team/team-zelalem.jpg",
    },
    {
      id: "member-3",
      name: "Yohannes Haile",
      role: "Co-Founder & Developer",
      avatar: "/team/team-yohannes-haile.jpg",
    },
    {
      id: "member-4",
      name: "Zelalem",
      role: "Co-Founder & Developer",
      avatar: "/team/team-zelalem.jpg",
    },
    {
      id: "member-5",
      name: "Yohannes Haile",
      role: "Co-Founder & Developer",
      avatar: "/team/team-yohannes-haile.jpg",
    },
  ],
  className,
}: Team1Props) => {
  return (
    <section className={cn("py-32", className)}>
      <div className="container flex flex-col items-center text-center">
        <h2 className="my-6 text-2xl font-bold text-pretty lg:text-4xl">
          {heading}
        </h2>
        <p className="mb-8 max-w-3xl text-muted-foreground lg:text-xl">
          {description}
        </p>
      </div>
      <div className="container mt-16 grid gap-x-3 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
        {members.map((member) => (
          <div key={member.id} className="flex flex-col items-center">
            <Avatar className="mb-4 size-20 border md:mb-5 lg:size-24">
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.name}</AvatarFallback>
            </Avatar>
            <p className="text-center font-medium">{member.name}</p>
            <p className="text-center text-muted-foreground">{member.role}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export { Team1 };
