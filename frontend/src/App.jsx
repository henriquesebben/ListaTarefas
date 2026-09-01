// Importa os hooks do React que vamos usar
// useState → guarda dados que mudam na tela (ex: lista de tarefas, texto do input)
// useEffect → executa código quando a página carrega (ex: buscar tarefas da API)
// useRef → referência direta a um elemento HTML (ex: focar no input automaticamente)
import { useState, useEffect, useRef } from "react";

// ============================================================
// 🔧 CONFIGURAÇÃO DA API — endereço do seu backend Java
// Todas as chamadas HTTP vão para essa URL base
// ============================================================
const API_BASE = "http://localhost:8080/api/tarefas";

// ============================================================
// Objeto com todos os métodos que se comunicam com o backend
// Cada método faz uma requisição HTTP diferente
// ============================================================
const api = {

    // GET /api/tarefas → busca todas as tarefas do banco
    // Retorna uma lista (array) de tarefas em JSON
    getAll: async () => {
        const res = await fetch(API_BASE);  // Faz a requisição GET
        return res.json();                   // Converte a resposta para JSON
    },

    // POST /api/tarefas → cria uma tarefa nova
    // Envia os dados (titulo, descricao, prioridade) no body como JSON
    create: async (todo) => {
        const res = await fetch(API_BASE, {
            method: "POST",                                    // Método HTTP POST
            headers: { "Content-Type": "application/json" },   // Diz que o body é JSON
            body: JSON.stringify(todo),                         // Converte o objeto JS para texto JSON
        });
        return res.json();  // Retorna a tarefa criada (com id e dataCriacao gerados pelo banco)
    },

    // PUT /api/tarefas/:id → atualiza uma tarefa existente
    // O id vai na URL, os dados novos vão no body
    update: async (id, data) => {
        const res = await fetch(`${API_BASE}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        return res.json();  // Retorna a tarefa atualizada
    },

    // PATCH /api/tarefas/:id/toggle → alterna completa/pendente
    // Não envia body — o backend inverte o valor automaticamente
    toggle: async (id) => {
        const res = await fetch(`${API_BASE}/${id}/toggle`, {
            method: "PATCH",
        });
        return res.json();  // Retorna a tarefa com o campo completa invertido
    },

    // DELETE /api/tarefas/:id → deleta uma tarefa
    // Não retorna nada (status 204 No Content)
    delete: async (id) => {
        await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
    },
};

// ============================================================
// Componente de ícones SVG (sem dependência externa)
// Cada ícone é um SVG inline que recebe um nome e tamanho
// Uso: <Icon name="plus" size={16} />
// ============================================================
const Icon = ({ name, size = 18 }) => {
    // Estilo base de todos os ícones
    const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };

    // Objeto com todos os ícones disponíveis
    const icons = {
        // Ícone de + (adicionar)
        plus: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
        ),
        // Ícone de ✓ (concluído)
        check: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
            </svg>
        ),
        // Ícone de lixeira (deletar)
        trash: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
        ),
        // Ícone de lápis (editar)
        edit: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
        ),
        // Ícone de lupa (buscar)
        search: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
        ),
        // Ícone de xícara de café (logo do app)
        coffee: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
        ),
        // Ícone de X (fechar)
        x: (
            <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
        ),
    };

    // Retorna o ícone pelo nome, ou nada se não existir
    return icons[name] || null;
};

// ============================================================
// Configuração de prioridades
// Cada prioridade tem: valor (enviado à API), label (mostrado na tela), cor
// ============================================================
const PRIORITIES = [
    { value: "LOW", label: "Baixa", color: "#94a3b8" },      // Cinza
    { value: "MEDIUM", label: "Média", color: "#f59e0b" },    // Amarelo
    { value: "HIGH", label: "Alta", color: "#ef4444" },        // Vermelho
];

// ============================================================
// Componente que mostra a badge de prioridade (ex: "ALTA" em vermelho)
// Recebe a prioridade como prop e encontra a cor correspondente
// ============================================================
function PriorityBadge({ priority }) {
    // Procura a prioridade na lista, se não achar usa a primeira (LOW)
    const p = PRIORITIES.find((pr) => pr.value === priority) || PRIORITIES[0];
    return (
        <span
            style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",       // Texto em maiúsculo
                color: p.color,                    // Cor do texto
                background: p.color + "18",        // Cor de fundo com transparência
                padding: "2px 8px",
                borderRadius: 4,
                border: `1px solid ${p.color}30`,  // Borda com transparência
            }}
        >
      {p.label}
    </span>
    );
}

// ============================================================
// Componente de cada tarefa na lista
// Mostra: checkbox, título, descrição, prioridade, data, botões de ação
// ============================================================
function TodoItem({ todo, onToggle, onDelete, onEdit }) {
    // Estado para saber se o mouse está em cima do item (mostra botões de ação)
    const [hovering, setHovering] = useState(false);

    // Formata a data ISO para formato brasileiro (ex: "01 de set.")
    const formatDate = (iso) => {
        if (!iso) return "";
        const d = new Date(iso);
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    };

    return (
        <div
            // Quando o mouse entra/sai do item, ativa/desativa o hover
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
            style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "14px 16px",
                background: hovering ? "#1e293b" : "transparent",  // Muda fundo ao passar mouse
                borderRadius: 10,
                transition: "all 0.2s ease",                         // Animação suave
                // Borda colorida na esquerda conforme a prioridade
                borderLeft: `3px solid ${PRIORITIES.find((p) => p.value === todo.prioridade)?.color || "#94a3b8"}`,
            }}
        >
            {/* ===== CHECKBOX (marcar como concluída) ===== */}
            <button
                onClick={() => onToggle(todo.id)}  // Ao clicar, chama PATCH /toggle na API
                style={{
                    marginTop: 2,
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    // Se completa: fundo verde sem borda. Se pendente: transparente com borda cinza
                    border: todo.completa ? "none" : "2px solid #475569",
                    background: todo.completa ? "#22c55e" : "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                }}
                aria-label={todo.completa ? "Marcar como pendente" : "Marcar como concluída"}
            >
                {/* Mostra o ícone de check só quando está concluída */}
                {todo.completa && <Icon name="check" size={14} />}
            </button>

            {/* ===== CONTEÚDO (título + descrição + prioridade + data) ===== */}
            <div style={{ flex: 1, minWidth: 0 }}>
                {/* Título da tarefa */}
                <p
                    style={{
                        margin: 0,
                        fontSize: 15,
                        fontWeight: 500,
                        // Se completa: texto cinza riscado. Se pendente: texto branco normal
                        color: todo.completa ? "#64748b" : "#e2e8f0",
                        textDecoration: todo.completa ? "line-through" : "none",
                        transition: "all 0.2s ease",
                        lineHeight: 1.4,
                    }}
                >
                    {todo.titulo}
                </p>

                {/* Descrição da tarefa (só aparece se tiver) */}
                {todo.descricao && (
                    <p
                        style={{
                            margin: "4px 0 0",
                            fontSize: 13,
                            color: "#64748b",
                            lineHeight: 1.4,
                            textDecoration: todo.completa ? "line-through" : "none",
                        }}
                    >
                        {todo.descricao}
                    </p>
                )}

                {/* Badge de prioridade + data de criação */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
                    <PriorityBadge priority={todo.prioridade} />
                    <span style={{ fontSize: 11, color: "#475569" }}>{formatDate(todo.dataCriacao)}</span>
                </div>
            </div>

            {/* ===== BOTÕES DE AÇÃO (editar e deletar) ===== */}
            {/* Só aparecem quando o mouse está em cima do item */}
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    opacity: hovering ? 1 : 0,        // Visível só no hover
                    transition: "opacity 0.15s ease",
                }}
            >
                {/* Botão editar */}
                <button onClick={() => onEdit(todo)} style={actionBtnStyle} aria-label="Editar">
                    <Icon name="edit" size={15} />
                </button>
                {/* Botão deletar (vermelho) */}
                <button onClick={() => onDelete(todo.id)} style={{ ...actionBtnStyle, color: "#ef4444" }} aria-label="Excluir">
                    <Icon name="trash" size={15} />
                </button>
            </div>
        </div>
    );
}

// Estilo base dos botões de ação (editar/deletar)
const actionBtnStyle = {
    background: "transparent",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    padding: 6,
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
};

// ============================================================
// COMPONENTE PRINCIPAL — App
// Controla tudo: lista de tarefas, filtros, formulário, comunicação com API
// ============================================================
export default function App() {

    // ===== ESTADOS (dados que mudam na tela) =====
    const [todos, setTodos] = useState([]);              // Lista de tarefas
    const [filter, setFilter] = useState("ALL");          // Filtro ativo: ALL, PENDING, COMPLETED
    const [search, setSearch] = useState("");              // Texto da barra de busca
    const [showForm, setShowForm] = useState(false);       // Modal do formulário visível ou não
    const [editingTodo, setEditingTodo] = useState(null);  // Tarefa sendo editada (null = criando nova)
    const [titulo, setTitulo] = useState("");              // Campo título do formulário
    const [descricao, setDescricao] = useState("");        // Campo descrição do formulário
    const [prioridade, setPrioridade] = useState("MEDIUM");// Campo prioridade do formulário
    const [loading, setLoading] = useState(true);          // Mostra "Carregando..." enquanto busca dados
    const [erro, setErro] = useState(null);                // Mensagem de erro de conexão
    const inputRef = useRef(null);                          // Referência ao input de título (para focar)

    // ===== EFEITO: Carrega tarefas da API quando a página abre =====
    useEffect(() => {
        api.getAll()
            .then((data) => {
                setTodos(data);        // Salva as tarefas no estado
                setLoading(false);     // Para de mostrar "Carregando..."
            })
            .catch(() => {
                // Se não conseguir conectar, mostra mensagem de erro
                setErro("Não conseguiu conectar à API. Verifique se o backend está rodando na porta 8080.");
                setLoading(false);
            });
    }, []);  // [] = executa só uma vez quando a página carrega

    // ===== EFEITO: Foca no input de título quando o formulário abre =====
    useEffect(() => {
        if (showForm && inputRef.current) inputRef.current.focus();
    }, [showForm]);

    // ===== Limpa o formulário e fecha o modal =====
    const resetForm = () => {
        setTitulo("");
        setDescricao("");
        setPrioridade("MEDIUM");
        setEditingTodo(null);
        setShowForm(false);
    };

    // ===== CRIAR ou ATUALIZAR tarefa =====
    const handleSubmit = async () => {
        if (!titulo.trim()) return;  // Não permite título vazio
        try {
            if (editingTodo) {
                // Se está editando → chama PUT /api/tarefas/:id
                const updated = await api.update(editingTodo.id, { titulo, descricao, prioridade });
                // Atualiza a tarefa na lista local (sem precisar recarregar tudo)
                setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? updated : t)));
            } else {
                // Se está criando → chama POST /api/tarefas
                const newTodo = await api.create({ titulo, descricao, prioridade });
                // Adiciona a tarefa nova no início da lista
                setTodos((prev) => [newTodo, ...prev]);
            }
            resetForm();  // Limpa e fecha o formulário
        } catch (e) {
            alert("Erro ao salvar tarefa");
        }
    };

    // ===== ALTERNAR concluída/pendente =====
    const handleToggle = async (id) => {
        try {
            // Chama PATCH /api/tarefas/:id/toggle
            const updated = await api.toggle(id);
            // Atualiza a tarefa na lista local
            setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
        } catch (e) {
            alert("Erro ao atualizar tarefa");
        }
    };

    // ===== DELETAR tarefa =====
    const handleDelete = async (id) => {
        try {
            // Chama DELETE /api/tarefas/:id
            await api.delete(id);
            // Remove da lista local
            setTodos((prev) => prev.filter((t) => t.id !== id));
        } catch (e) {
            alert("Erro ao deletar tarefa");
        }
    };

    // ===== Abrir formulário para EDITAR uma tarefa existente =====
    const handleEdit = (todo) => {
        setTitulo(todo.titulo);                // Preenche o campo com o título atual
        setDescricao(todo.descricao || "");     // Preenche a descrição (ou vazio se não tiver)
        setPrioridade(todo.prioridade);         // Preenche a prioridade atual
        setEditingTodo(todo);                   // Marca qual tarefa está sendo editada
        setShowForm(true);                      // Abre o modal do formulário
    };

    // ===== FILTRO + BUSCA =====
    // Aplica o filtro de status (todas/pendentes/concluídas)
    // e depois filtra pela barra de busca (título ou descrição)
    const filtered = todos
        .filter((t) => {
            if (filter === "PENDING") return !t.completa;     // Só pendentes
            if (filter === "COMPLETED") return t.completa;     // Só concluídas
            return true;                                        // Todas
        })
        .filter((t) => {
            if (!search) return true;  // Se não tem busca, mostra tudo
            const s = search.toLowerCase();
            // Busca no título OU na descrição (ignora maiúsculas)
            return t.titulo.toLowerCase().includes(s) || (t.descricao || "").toLowerCase().includes(s);
        });

    // ===== CONTADORES para os botões de filtro =====
    const counts = {
        all: todos.length,                                    // Total de tarefas
        pending: todos.filter((t) => !t.completa).length,     // Pendentes
        completed: todos.filter((t) => t.completa).length,    // Concluídas
    };

    // Configuração dos botões de filtro
    const filters = [
        { key: "ALL", label: "Todas", count: counts.all },
        { key: "PENDING", label: "Pendentes", count: counts.pending },
        { key: "COMPLETED", label: "Concluídas", count: counts.completed },
    ];

    // ===== RENDERIZAÇÃO (o que aparece na tela) =====
    return (
        <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
            <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>

                {/* ===== CABEÇALHO ===== */}
                <header style={{ marginBottom: 32 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                        <span style={{ color: "#f59e0b" }}><Icon name="coffee" size={28} /></span>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", color: "#f8fafc" }}>
                            Lista de Tarefas
                        </h1>
                    </div>
                    <p style={{ margin: 0, fontSize: 14, color: "#64748b", marginTop: 4 }}>
                        Organize suas tarefas de estudo e projetos
                    </p>
                </header>

                {/* ===== MENSAGEM DE ERRO (se o backend não estiver rodando) ===== */}
                {erro && (
                    <div style={{
                        padding: "12px 16px",
                        background: "#ef444420",
                        border: "1px solid #ef444440",
                        borderRadius: 10,
                        color: "#ef4444",
                        fontSize: 13,
                        marginBottom: 16,
                    }}>
                        {erro}
                    </div>
                )}

                {/* ===== BARRA DE BUSCA + BOTÃO NOVA ===== */}
                <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                    {/* Campo de busca */}
                    <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
              <Icon name="search" size={16} />
            </span>
                        <input
                            type="text"
                            placeholder="Buscar tarefas..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}  // Atualiza o estado de busca
                            style={{
                                width: "100%",
                                padding: "10px 12px 10px 38px",
                                background: "#1e293b",
                                border: "1px solid #334155",
                                borderRadius: 10,
                                color: "#e2e8f0",
                                fontSize: 14,
                                outline: "none",
                                boxSizing: "border-box",
                                transition: "border-color 0.2s",
                            }}
                            onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}   // Borda amarela ao focar
                            onBlur={(e) => (e.target.style.borderColor = "#334155")}     // Volta ao normal ao sair
                        />
                    </div>
                    {/* Botão "Nova" → abre o formulário para criar tarefa */}
                    <button
                        onClick={() => { resetForm(); setShowForm(true); }}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            padding: "10px 18px",
                            background: "#f59e0b",
                            color: "#0f172a",
                            border: "none",
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: "pointer",
                            transition: "background 0.2s",
                            whiteSpace: "nowrap",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#eab308")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#f59e0b")}
                    >
                        <Icon name="plus" size={16} /> Nova
                    </button>
                </div>

                {/* ===== BOTÕES DE FILTRO (Todas, Pendentes, Concluídas) ===== */}
                <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                    {filters.map((f) => (
                        <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}  // Muda o filtro ativo
                            style={{
                                padding: "6px 14px",
                                fontSize: 13,
                                fontWeight: 600,
                                borderRadius: 8,
                                border: "none",
                                cursor: "pointer",
                                // Filtro ativo: fundo amarelo. Inativo: transparente
                                background: filter === f.key ? "#f59e0b20" : "transparent",
                                color: filter === f.key ? "#f59e0b" : "#64748b",
                                transition: "all 0.2s",
                            }}
                        >
                            {f.label}
                            {/* Badge com o número de tarefas nesse filtro */}
                            <span
                                style={{
                                    marginLeft: 6,
                                    fontSize: 11,
                                    background: filter === f.key ? "#f59e0b30" : "#1e293b",
                                    padding: "1px 7px",
                                    borderRadius: 10,
                                    fontWeight: 700,
                                }}
                            >
                {f.count}
              </span>
                        </button>
                    ))}
                </div>

                {/* ===== MODAL DO FORMULÁRIO (criar/editar tarefa) ===== */}
                {/* Só aparece quando showForm é true */}
                {showForm && (
                    // Fundo escuro do modal — clica fora para fechar
                    <div
                        style={{
                            position: "fixed",
                            inset: 0,
                            background: "rgba(0,0,0,0.6)",
                            backdropFilter: "blur(4px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            zIndex: 50,
                            padding: 20,
                        }}
                        onClick={(e) => e.target === e.currentTarget && resetForm()}  // Fecha ao clicar no fundo
                    >
                        {/* Caixa do formulário */}
                        <div
                            style={{
                                background: "#1e293b",
                                borderRadius: 16,
                                padding: 28,
                                width: "100%",
                                maxWidth: 460,
                                border: "1px solid #334155",
                                boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
                            }}
                        >
                            {/* Cabeçalho do modal: título + botão fechar */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
                                    {/* Muda o título conforme está criando ou editando */}
                                    {editingTodo ? "Editar tarefa" : "Nova tarefa"}
                                </h2>
                                <button onClick={resetForm} style={{ ...actionBtnStyle, color: "#64748b" }}>
                                    <Icon name="x" size={18} />
                                </button>
                            </div>

                            {/* Campos do formulário */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

                                {/* ===== CAMPO TÍTULO ===== */}
                                <div>
                                    <label style={labelStyle}>Título *</label>
                                    <input
                                        ref={inputRef}  // Referência para focar automaticamente
                                        type="text"
                                        value={titulo}
                                        onChange={(e) => setTitulo(e.target.value)}
                                        placeholder="Ex.: Estudar Spring Boot"
                                        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}  // Enter = salvar
                                        style={inputStyle}
                                        onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                                        onBlur={(e) => (e.target.style.borderColor = "#334155")}
                                    />
                                </div>

                                {/* ===== CAMPO DESCRIÇÃO ===== */}
                                <div>
                                    <label style={labelStyle}>Descrição</label>
                                    <textarea
                                        value={descricao}
                                        onChange={(e) => setDescricao(e.target.value)}
                                        placeholder="Detalhes opcionais da tarefa..."
                                        rows={3}  // Altura inicial de 3 linhas
                                        style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                                        onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                                        onBlur={(e) => (e.target.style.borderColor = "#334155")}
                                    />
                                </div>

                                {/* ===== SELETOR DE PRIORIDADE ===== */}
                                <div>
                                    <label style={labelStyle}>Prioridade</label>
                                    <div style={{ display: "flex", gap: 8 }}>
                                        {/* Cria um botão para cada prioridade (Baixa, Média, Alta) */}
                                        {PRIORITIES.map((p) => (
                                            <button
                                                key={p.value}
                                                onClick={() => setPrioridade(p.value)}  // Seleciona a prioridade
                                                style={{
                                                    flex: 1,
                                                    padding: "8px 0",
                                                    borderRadius: 8,
                                                    // Botão selecionado: borda colorida + fundo. Não selecionado: cinza
                                                    border: `2px solid ${prioridade === p.value ? p.color : "#334155"}`,
                                                    background: prioridade === p.value ? p.color + "15" : "transparent",
                                                    color: prioridade === p.value ? p.color : "#64748b",
                                                    fontSize: 13,
                                                    fontWeight: 600,
                                                    cursor: "pointer",
                                                    transition: "all 0.2s",
                                                }}
                                            >
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* ===== BOTÃO SALVAR ===== */}
                                <button
                                    onClick={handleSubmit}
                                    disabled={!titulo.trim()}  // Desabilitado se título vazio
                                    style={{
                                        marginTop: 4,
                                        padding: "12px 0",
                                        // Amarelo se tem título, cinza se vazio
                                        background: titulo.trim() ? "#f59e0b" : "#334155",
                                        color: titulo.trim() ? "#0f172a" : "#64748b",
                                        border: "none",
                                        borderRadius: 10,
                                        fontSize: 15,
                                        fontWeight: 700,
                                        cursor: titulo.trim() ? "pointer" : "not-allowed",
                                        transition: "background 0.2s",
                                    }}
                                >
                                    {/* Texto muda conforme está criando ou editando */}
                                    {editingTodo ? "Salvar alterações" : "Criar tarefa"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ===== LISTA DE TAREFAS ===== */}
                <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {loading ? (
                        // Mostra enquanto carrega os dados da API
                        <p style={{ textAlign: "center", color: "#475569", padding: 40 }}>Carregando...</p>
                    ) : filtered.length === 0 ? (
                        // Mostra quando não tem tarefas (ou a busca não encontrou nada)
                        <div style={{ textAlign: "center", padding: "48px 20px", color: "#475569" }}>
                            <p style={{ fontSize: 32, margin: "0 0 8px" }}>
                                {search ? "🔍" : filter === "COMPLETED" ? "🎯" : "☕"}
                            </p>
                            <p style={{ fontSize: 15, margin: 0, fontWeight: 500 }}>
                                {search
                                    ? "Nenhuma tarefa encontrada"
                                    : filter === "COMPLETED"
                                        ? "Nenhuma tarefa concluída ainda"
                                        : "Nenhuma tarefa por aqui"}
                            </p>
                            <p style={{ fontSize: 13, margin: "4px 0 0", color: "#334155" }}>
                                {!search && filter === "ALL" && "Crie sua primeira tarefa para começar"}
                            </p>
                        </div>
                    ) : (
                        // Renderiza cada tarefa usando o componente TodoItem
                        filtered.map((todo) => (
                            <TodoItem
                                key={todo.id}           // Chave única para o React identificar cada item
                                todo={todo}              // Dados da tarefa
                                onToggle={handleToggle}  // Função para alternar completa/pendente
                                onDelete={handleDelete}  // Função para deletar
                                onEdit={handleEdit}      // Função para abrir edição
                            />
                        ))
                    )}
                </div>

                {/* ===== RODAPÉ COM ESTATÍSTICAS ===== */}
                {/* Só aparece se tem pelo menos 1 tarefa */}
                {todos.length > 0 && (
                    <div
                        style={{
                            marginTop: 24,
                            padding: "12px 16px",
                            background: "#1e293b",
                            borderRadius: 10,
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: 13,
                            color: "#475569",
                        }}
                    >
                        {/* Quantidade de pendentes */}
                        <span>{counts.pending} pendente{counts.pending !== 1 ? "s" : ""}</span>
                        {/* Percentual de conclusão */}
                        <span>
              {counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0}% concluído
            </span>
                    </div>
                )}
            </div>
        </div>
    );
}

// ===== ESTILOS REUTILIZÁVEIS =====

// Estilo das labels dos campos do formulário
const labelStyle = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#94a3b8",
    marginBottom: 6,
};

// Estilo dos inputs e textarea do formulário
const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: 8,
    color: "#e2e8f0",
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
};