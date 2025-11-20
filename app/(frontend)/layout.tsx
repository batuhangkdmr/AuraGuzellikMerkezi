import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-primary-blue">
        {children}
      </main>
      <Footer />
    </>
  );
}

