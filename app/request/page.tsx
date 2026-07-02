import { SongRequestForm } from "@/components/SongRequestForm";

type RequestPageProps = {
  searchParams?: {
    table?: string;
  };
};

export const metadata = {
  title: "CHIT HOLE Song Request"
};

export default function RequestPage({ searchParams }: RequestPageProps) {
  const tableNumber = searchParams?.table?.trim();

  return <SongRequestForm tableNumber={tableNumber || undefined} />;
}
