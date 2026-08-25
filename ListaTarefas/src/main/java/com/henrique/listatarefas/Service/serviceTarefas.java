package com.henrique.listatarefas.Service;

import com.henrique.listatarefas.DTO.tarefaDTORequest;
import com.henrique.listatarefas.DTO.tarefaDTOResponse;
import com.henrique.listatarefas.Model.modelTarefas;
import com.henrique.listatarefas.repository.repositoryTarefas;
import org.springframework.stereotype.Service;
import java.util.List;

@Service


public class serviceTarefas {

    private final repositoryTarefas repository;


    //O Spring injeta o repository automaticamente
    public serviceTarefas(repositoryTarefas repository) {
        this.repository = repository;
    }

    //LISTAR TODAS
    public List<tarefaDTOResponse> listarTodas() {
        return repository.findAll()
                .stream()
                .map(tarefaDTOResponse::new)
                .toList();
    }

    //BUSCAR POR ID
    public tarefaDTOResponse buscarPorId(Long id) {
        modelTarefas tarefa = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada com id: " + id));
        return new tarefaDTOResponse(tarefa);
    }

    //CRIAR
    public tarefaDTOResponse criar(tarefaDTORequest dto) {
        modelTarefas tarefa = new modelTarefas();
        tarefa.setTitulo(dto.getTitulo());
        tarefa.setPrioridade(dto.getPrioridade());
        tarefa.setCompleta(false);

        modelTarefas salvo = repository.save(tarefa);
        return new tarefaDTOResponse(salvo);
    }

    //ATUALIZAR
    public tarefaDTOResponse atualizar(Long id, tarefaDTORequest dto) {
        modelTarefas tarefa = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada com id: " + id));

        tarefa.setTitulo(dto.getTitulo());
        tarefa.setPrioridade(dto.getPrioridade());

        modelTarefas atualizado = repository.save(tarefa);
        return new tarefaDTOResponse(atualizado);
    }

    //ALTERNAR COMPLETA
    public tarefaDTOResponse alternarCompleta(Long id) {
        modelTarefas tarefa = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tarefa não encontrada com id: " + id));

        tarefa.setCompleta(!tarefa.getCompleta());

        modelTarefas atualizado = repository.save(tarefa);
        return new tarefaDTOResponse(atualizado);
    }

    //DELETAR
    public void deletar(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Tarefa não encontrada com id: " + id);
        }
        repository.deleteById(id);
    }
}
