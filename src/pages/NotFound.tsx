import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: route not found", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="glass-panel-strong w-full max-w-xl rounded-[32px] p-8 text-center">
        <div className="hero-kicker mx-auto w-fit">404</div>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white">Página não encontrada</h1>
        <p className="mt-4 text-base leading-8 text-slate-300">
          O endereço pedido não existe nesta rota. Volte para a home e continue por aqui.
        </p>
        <Link to="/" className="btn-dark mx-auto mt-8 w-fit">
          Voltar para a home
        </Link>
      </div>
    </div>
  );
}
