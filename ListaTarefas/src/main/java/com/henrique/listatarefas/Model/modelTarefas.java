package com.henrique.listatarefas.Model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;


@Table(name = "tarefas") //nome da tabela
@Entity //Diz ao JPA: "essa classe é uma tabela no banco"
@AllArgsConstructor //construtor com todos os campos
@NoArgsConstructor //construtor vazio
@Data //Lombok gera getters, setters, toString, equals, hashCode

public class modelTarefas {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String titulo; //nome da tarefa (titulo), obrigatório, máximo 100 caracteres

    @Column(length = 500)
    private String descricao; //detalhes opcionais, máximo 500 caracteres

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Priority prioridade; //usa o enum Priority (LOW, MEDIUM, HIGH)

    @Column(nullable = false)
    private Boolean completa = false; //Valida se a tarefa já foi concluída (começa sempre como false, muda para true quando é concluída)

    @Column(nullable = false, updatable = false)
    private LocalDateTime dataCriacao; //data de criação, preenchida automaticamente pelo @PrePersist

    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
    }

}
