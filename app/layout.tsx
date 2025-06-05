import "@/app/ui/global.css"
import {inter} from '@/app/ui/fonts'
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>{/*estou colocando a fonte personalizada com "inter.className", e "suavizando-a" com o "antialiased" */}
    </html>
  );
}
