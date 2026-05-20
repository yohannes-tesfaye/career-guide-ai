import { Navbar1 } from "@/components/SharedComponents/navbar1";

export default function UserFacingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <div className="min-h-full flex flex-col">
        <Navbar1 />
        {children}
      </div>
    </div>
  );
}
