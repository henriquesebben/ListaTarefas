import { useState, useEffect, useRef } from "react";

// ============================================================
// 🔧 CONFIGURAÇÃO — aponta para sua API Java
// ============================================================
const API_BASE = "http://localhost:8080/api/tarefas";

const api = {
  // GET /api/tarefas → lista todas
  getAll: async () => {
    const res = await fetch(API_BASE);
    return res.json();
  },

  // POST /api/tarefas → cria nova
  create: async (todo) => {
    const res = await fetch(API_BASE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    });
    return res.json();
  },

  // PUT /api/tarefas/:id → atualiza
  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  // PATCH /api/tarefas/:id/toggle → alterna completa
  toggle: async (id) => {
    const res = await fetch(`${API_BASE}/${id}/toggle`, {
      method: "PATCH",
    });
    return res.json();
  },

  // DELETE /api/tarefas/:id → deleta
  delete: async (id) => {
    await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  },
};

// ============================================================
// Ícones inline
// ============================================================
const Icon = ({ name, size = 18 }) => {
  const s = { width: size, height: size, display: "inline-block", verticalAlign: "middle" };
  const icons = {
    plus: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    ),
    check: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    trash: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
    ),
    edit: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
    ),
    search: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    ),
    coffee: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
          <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
    ),
    x: (
        <svg style={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    ),
  };
  return icons[name] || null;
};

// ============================================================
// Componentes
// ============================================================
const PRIORITIES = [
  { value: "LOW", label: "Baixa", color: "#94a3b8" },
  { value: "MEDIUM", label: "Média", color: "#f59e0b" },
  { value: "HIGH", label: "Alta", color: "#ef4444" },
];

function PriorityBadge({ priority }) {
  const p = PRIORITIES.find((pr) => pr.value === priority) || PRIORITIES[0];
  return (
      <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            color: p.color,
            background: p.color + "18",
            padding: "2px 8px",
            borderRadius: 4,
            border: `1px solid ${p.color}30`,
          }}
      >
      {p.label}
    </span>
  );
}

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [hovering, setHovering] = useState(false);

  const formatDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
  };

  return (
      <div
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            background: hovering ? "#1e293b" : "transparent",
            borderRadius: 10,
            transition: "all 0.2s ease",
            borderLeft: `3px solid ${PRIORITIES.find((p) => p.value === todo.prioridade)?.color || "#94a3b8"}`,
          }}
      >
        <button
            onClick={() => onToggle(todo.id)}
            style={{
              marginTop: 2,
              width: 22,
              height: 22,
              borderRadius: 6,
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
          {todo.completa && <Icon name="check" size={14} />}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
              style={{
                margin: 0,
                fontSize: 15,
                fontWeight: 500,
                color: todo.completa ? "#64748b" : "#e2e8f0",
                textDecoration: todo.completa ? "line-through" : "none",
                transition: "all 0.2s ease",
                lineHeight: 1.4,
              }}
          >
            {todo.titulo}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <PriorityBadge priority={todo.prioridade} />
            <span style={{ fontSize: 11, color: "#475569" }}>{formatDate(todo.dataCriacao)}</span>
          </div>
        </div>

        <div
            style={{
              display: "flex",
              gap: 4,
              opacity: hovering ? 1 : 0,
              transition: "opacity 0.15s ease",
            }}
        >
          <button onClick={() => onEdit(todo)} style={actionBtnStyle} aria-label="Editar">
            <Icon name="edit" size={15} />
          </button>
          <button onClick={() => onDelete(todo.id)} style={{ ...actionBtnStyle, color: "#ef4444" }} aria-label="Excluir">
            <Icon name="trash" size={15} />
          </button>
        </div>
      </div>
  );
}

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
// App principal
// ============================================================
export default function App() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [prioridade, setPrioridade] = useState("MEDIUM");
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);

  // Carrega as tarefas da API ao abrir
  useEffect(() => {
    api.getAll()
        .then((data) => {
          setTodos(data);
          setLoading(false);
        })
        .catch(() => {
          setErro("Não conseguiu conectar à API. Verifique se o backend está rodando na porta 8080.");
          setLoading(false);
        });
  }, []);

  useEffect(() => {
    if (showForm && inputRef.current) inputRef.current.focus();
  }, [showForm]);

  const resetForm = () => {
    setTitulo("");
    setPrioridade("MEDIUM");
    setEditingTodo(null);
    setShowForm(false);
  };

  // Criar ou atualizar tarefa
  const handleSubmit = async () => {
    if (!titulo.trim()) return;
    try {
      if (editingTodo) {
        const updated = await api.update(editingTodo.id, { titulo, prioridade });
        setTodos((prev) => prev.map((t) => (t.id === editingTodo.id ? updated : t)));
      } else {
        const newTodo = await api.create({ titulo, prioridade });
        setTodos((prev) => [newTodo, ...prev]);
      }
      resetForm();
    } catch (e) {
      alert("Erro ao salvar tarefa");
    }
  };

  // Alternar completa/pendente (usa PATCH /toggle)
  const handleToggle = async (id) => {
    try {
      const updated = await api.toggle(id);
      setTodos((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (e) {
      alert("Erro ao atualizar tarefa");
    }
  };

  // Deletar tarefa
  const handleDelete = async (id) => {
    try {
      await api.delete(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      alert("Erro ao deletar tarefa");
    }
  };

  // Abrir formulário de edição
  const handleEdit = (todo) => {
    setTitulo(todo.titulo);
    setPrioridade(todo.prioridade);
    setEditingTodo(todo);
    setShowForm(true);
  };

  // Filtro e busca
  const filtered = todos
      .filter((t) => {
        if (filter === "PENDING") return !t.completa;
        if (filter === "COMPLETED") return t.completa;
        return true;
      })
      .filter((t) => {
        if (!search) return true;
        return t.titulo.toLowerCase().includes(search.toLowerCase());
      });

  const counts = {
    all: todos.length,
    pending: todos.filter((t) => !t.completa).length,
    completed: todos.filter((t) => t.completa).length,
  };

  const filters = [
    { key: "ALL", label: "Todas", count: counts.all },
    { key: "PENDING", label: "Pendentes", count: counts.pending },
    { key: "COMPLETED", label: "Concluídas", count: counts.completed },
  ];

  return (
      <div style={{ minHeight: "100vh", background: "#0f172a", color: "#e2e8f0", fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>

          {/* Header */}
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

          {/* Erro de conexão */}
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

          {/* Search + Add */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#475569" }}>
              <Icon name="search" size={16} />
            </span>
              <input
                  type="text"
                  placeholder="Buscar tarefas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
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
                  onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                  onBlur={(e) => (e.target.style.borderColor = "#334155")}
              />
            </div>
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

          {/* Filters */}
          <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {filters.map((f) => (
                <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    style={{
                      padding: "6px 14px",
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 8,
                      border: "none",
                      cursor: "pointer",
                      background: filter === f.key ? "#f59e0b20" : "transparent",
                      color: filter === f.key ? "#f59e0b" : "#64748b",
                      transition: "all 0.2s",
                    }}
                >
                  {f.label}
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

          {/* Form Modal */}
          {showForm && (
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
                  onClick={(e) => e.target === e.currentTarget && resetForm()}
              >
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
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f8fafc" }}>
                      {editingTodo ? "Editar tarefa" : "Nova tarefa"}
                    </h2>
                    <button onClick={resetForm} style={{ ...actionBtnStyle, color: "#64748b" }}>
                      <Icon name="x" size={18} />
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <label style={labelStyle}>Título *</label>
                      <input
                          ref={inputRef}
                          type="text"
                          value={titulo}
                          onChange={(e) => setTitulo(e.target.value)}
                          placeholder="Ex.: Estudar Spring Boot"
                          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                          style={inputStyle}
                          onFocus={(e) => (e.target.style.borderColor = "#f59e0b")}
                          onBlur={(e) => (e.target.style.borderColor = "#334155")}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Prioridade</label>
                      <div style={{ display: "flex", gap: 8 }}>
                        {PRIORITIES.map((p) => (
                            <button
                                key={p.value}
                                onClick={() => setPrioridade(p.value)}
                                style={{
                                  flex: 1,
                                  padding: "8px 0",
                                  borderRadius: 8,
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

                    <button
                        onClick={handleSubmit}
                        disabled={!titulo.trim()}
                        style={{
                          marginTop: 4,
                          padding: "12px 0",
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
                      {editingTodo ? "Salvar alterações" : "Criar tarefa"}
                    </button>
                  </div>
                </div>
              </div>
          )}

          {/* Todo List */}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {loading ? (
                <p style={{ textAlign: "center", color: "#475569", padding: 40 }}>Carregando...</p>
            ) : filtered.length === 0 ? (
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
                filtered.map((todo) => (
                    <TodoItem
                        key={todo.id}
                        todo={todo}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                    />
                ))
            )}
          </div>

          {/* Footer stats */}
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
                <span>{counts.pending} pendente{counts.pending !== 1 ? "s" : ""}</span>
                <span>
              {counts.all > 0 ? Math.round((counts.completed / counts.all) * 100) : 0}% concluído
            </span>
              </div>
          )}
        </div>
      </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#94a3b8",
  marginBottom: 6,
};

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