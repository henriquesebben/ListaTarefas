package com.henrique.listatarefas.DTO;

import  lombok.*;
import com.henrique.listatarefas.Model.modelTarefas;
import com.henrique.listatarefas.Model.Priority;
import  java.time.LocalDateTime;

@Data

public class tarefaDTOResponse {

    // Todos os campos que a API DEVOLVE para o cliente
    private Long id;
    private String titulo;
    private Boolean completa;
    private Priority prioridade;
    private LocalDateTime dataCriacao;
    private String descricao;


    //pega tudo do model e transfere para aqui no DTO
    public tarefaDTOResponse(modelTarefas tarefa) {
        this.id = tarefa.getId();
        this.titulo = tarefa.getTitulo();
        this.completa = tarefa.getCompleta();
        this.prioridade = tarefa.getPrioridade();
        this.dataCriacao = tarefa.getDataCriacao();
        this.descricao = tarefa.getDescricao();
    } }
