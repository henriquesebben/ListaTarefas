package com.henrique.listatarefas.DTO;

import com.henrique.listatarefas.Model.Priority;
import jakarta.validation.constraints.*;
import  lombok.Data;

@Data

public class tarefaDTORequest {
    @NotBlank(message = "O título é obrigatório") //mensagem obrigatória
    @Size(min = 3, max = 100, message = "Título deve ter entre 3 e 100 caracteres") //tamanho da mensagem
    private String titulo;

    @Size(max = 500, min = 0, message = "Descreva sua tarefa, max de 500 caracteres")
    private String descricao;

    // @NotNull → não pode ser nulo (diferente de @NotBlank,que é só para Strings)
    // Usado aqui porque Priority é um enum, não uma String
    @NotNull(message = "A prioridade é obrigatória")
    private Priority prioridade;

}
