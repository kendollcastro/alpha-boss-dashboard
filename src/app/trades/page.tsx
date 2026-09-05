import { DataTable } from "@/components/data-table"

export default function Page({ trades }: { trades: any }) {
  return <DataTable data={trades ?? []} />
}