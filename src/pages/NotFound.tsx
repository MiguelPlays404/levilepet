import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Seo } from "@/components/Seo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4">
      <Seo
        title="Página não encontrada (404)"
        description="A página que você procura não existe ou foi movida. Volte para a página inicial do Le Ville Pet."
        path={location.pathname}
        noindex
      />
      <div className="text-center">
        <h1 className="mb-4 font-heading text-5xl font-extrabold text-primary">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Ops! Não encontramos esta página.
        </p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          Voltar para a página inicial
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
