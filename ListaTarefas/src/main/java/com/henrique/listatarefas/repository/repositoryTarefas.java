package com.henrique.listatarefas.repository;

import com.henrique.listatarefas.Model.Priority;
import com.henrique.listatarefas.Model.modelTarefas;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface repositoryTarefas extends JpaRepository<modelTarefas, Long> {
    List<modelTarefas> findByTituloContainingIgnoreCase(String titulo);
    List<modelTarefas> findByCompleta(Boolean completa);
    List<modelTarefas> findByDataCriacao(LocalDateTime dataCriacao);
    List<modelTarefas> findByPrioridade(Priority prioridade);


}
