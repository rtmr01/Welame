import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Trophy,
    Dribbble,
    Gamepad2,
    Target,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    TrendingUp,
    ChevronRight,
} from 'lucide-react';

const sports = [
    {
        id: 'futebol',
        label: 'Futebol',
        icon: Trophy,
        path: '/lobby/futebol',
        description: 'Mercados de partida com leitura tática em tempo real.',
    },
    {
        id: 'basquete',
        label: 'Basquete',
        icon: Dribbble,
        path: '/lobby/basquete',
        description: 'Ritmo, posse e pressão para decisões mais precisas.',
    },
    {
        id: 'esports',
        label: 'Esports',
        icon: Gamepad2,
        path: '/lobby/esports',
        description: 'Leitura de rounds, momentum e cenários de virada.',
    },
    {
        id: 'tenis',
        label: 'Tênis',
        icon: Target,
        path: '/lobby/tenis',
        description: 'Games decisivos, estabilidade e pressão por set.',
    },
];

export const LandingPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
        navigate(`/lobby/futebol?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
        navigate(`/lobby/futebol`);
    }
};

    return (
        <div className="min-h-screen bg-[#1C1F5A] text-white font-sans relative overflow-hidden">
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(0,210,106,0.14),transparent_35%),radial-gradient(circle_at_85%_12%,rgba(0,210,106,0.08),transparent_30%),radial-gradient(circle_at_50%_95%,rgba(13,20,73,0.8),transparent_40%)]" />
                <div className="absolute inset-0 opacity-30 [background-size:40px_40px] [background-image:linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-5 py-6 md:px-8 md:py-8">
                <header className="mb-10 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-md md:px-6">
                    <div className="flex items-center gap-3">
                        <img src="/prostats.png" alt="Pro Stats" className="h-9 w-9 rounded-lg object-contain" />
                        <div>
                            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Pro Stats</p>
                            <p className="text-sm font-semibold text-white">Sports Intelligence Platform</p>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/lobby/futebol')}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#00D26A]/50 bg-[#00D26A]/15 px-4 py-2 text-sm font-semibold text-[#00D26A] transition hover:bg-[#00D26A] hover:text-[#1C1F5A]"
                    >
                        Entrar no Painel
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </header>

                <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#1f2366]/90 to-[#171a4e]/95 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-10">
                        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#00D26A]/40 bg-[#00D26A]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#00D26A]">
                            <Sparkles className="h-4 w-4" />
                            Plataforma Profissional
                        </div>

                        <h1 className="text-4xl font-black leading-[1.02] tracking-tight md:text-6xl">
                            Decisao esportiva com
                            <span className="block text-[#00D26A]">visual de produto elite</span>
                        </h1>

                        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/78 md:text-lg">
                            Centralize partidas, contextos e probabilidades em uma experiencia clara, moderna e orientada a resultado.
                            Estrutura pronta para operacao diaria de alta performance.
                        </p>

                        <form onSubmit={handleSearch} className="mt-8 rounded-2xl border border-white/10 bg-[#141745]/85 p-3 shadow-inner">
                            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
                                <Search className="absolute left-4 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-white/45 sm:block" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar por time ou liga"
                                    className="h-12 w-full rounded-xl border border-transparent bg-[#0f1238] px-4 text-base text-white placeholder:text-white/35 focus:border-[#00D26A]/45 focus:outline-none sm:pl-11"
                                />
                                <button
                                    type="submit"
                                    className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#00D26A] px-5 text-sm font-extrabold text-[#1C1F5A] transition hover:brightness-95"
                                >
                                    Iniciar Analise
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Confianca Media</p>
                                <p className="mt-2 text-3xl font-black text-[#00D26A]">89%</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Mercados Ativos</p>
                                <p className="mt-2 text-3xl font-black text-white">4</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                <p className="text-[11px] uppercase tracking-[0.14em] text-white/55">Atualizacao</p>
                                <p className="mt-2 text-3xl font-black text-white">Live</p>
                            </div>
                        </div>
                    </div>

                    <aside className="rounded-3xl border border-white/10 bg-[#121547]/90 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.35)] md:p-8">
                        <h2 className="text-xl font-extrabold tracking-tight">Visao Executiva</h2>
                        <p className="mt-2 text-sm leading-relaxed text-white/68">
                            Painel com linguagem objetiva, priorizacao de risco e leitura de contexto para tomada de decisao rapida.
                        </p>

                        <div className="mt-6 space-y-3">
                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <ShieldCheck className="mt-0.5 h-5 w-5 text-[#00D26A]" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Confiabilidade de Modelo</p>
                                    <p className="text-xs text-white/60">Calibragem continua por esporte e cenario.</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <TrendingUp className="mt-0.5 h-5 w-5 text-[#00D26A]" />
                                <div>
                                    <p className="text-sm font-semibold text-white">Leitura de Momentum</p>
                                    <p className="text-xs text-white/60">Variacao de probabilidade conforme contexto da partida.</p>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-[#00D26A]/35 bg-gradient-to-r from-[#00D26A]/18 to-[#00D26A]/8 p-4">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00D26A]">Performance Room</p>
                                <p className="mt-1 text-sm text-white/85">
                                    Arquitetura visual de nivel premium para uso constante, rapido e escalavel.
                                </p>
                            </div>
                        </div>
                    </aside>
                </section>

                <main className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {sports.map((sport) => {
                        const Icon = sport.icon;
                        return (
                            <button
                                key={sport.id}
                                onClick={() => navigate(sport.path)}
                                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#111443]/90 p-6 text-left transition duration-300 hover:-translate-y-1 hover:border-[#00D26A]/60 hover:shadow-[0_24px_40px_rgba(0,0,0,0.34)]"
                            >
                                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#00D26A]/15 blur-2xl transition group-hover:bg-[#00D26A]/25" />

                                <div className="relative flex h-full flex-col">
                                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border border-[#00D26A]/35 bg-[#00D26A]/10">
                                        <Icon className="h-6 w-6 text-[#00D26A]" strokeWidth={1.9} />
                                    </div>

                                    <h3 className="text-2xl font-bold tracking-tight">{sport.label}</h3>
                                    <p className="mt-2 flex-1 text-sm leading-relaxed text-white/70">{sport.description}</p>

                                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#00D26A]">
                                        Abrir modulo
                                        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </main>

                <footer className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-xs text-white/60 md:flex-row md:items-center md:px-6">
                    <p>© 2026 Pro Stats Technologies</p>
                    <p className="uppercase tracking-[0.16em]">Dados e eventos fornecidos por BetsAPI</p>
                </footer>
            </div>
        </div>
    );
};