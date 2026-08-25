package com.henrique.listatarefas.DTO;

import  lombok.*;
import com.henrique.listatarefas.Model.modelTarefas;
import com.henrique.listatarefas.Model.Priority;
import  java.time.LocalDateTime;

@Data

public class tarefaDTOResponse {

    // Todos os campos que a API DEVOLVE para o cliente
    private Long id;
    private String Titulo;
    private Boolean Completa;
    private Priority prioridade;
    private LocalDateTime dataCriacao;


    //pega tudo do model e transfere para aqui no DTO
    public tarefaDTOResponse(modelTarefas tarefa) {
        this.id = tarefa.getId();
        this.Titulo = tarefa.getTitulo();
        this.Completa = tarefa.getCompleta();
        this.prioridade = tarefa.getPrioridade();
        this.dataCriacao = tarefa.getDataCriacao();

    } }
