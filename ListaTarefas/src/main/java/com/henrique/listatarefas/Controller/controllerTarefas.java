package com.henrique.listatarefas.Controller;

import com.henrique.listatarefas.DTO.tarefaDTOResponse;
import com.henrique.listatarefas.DTO.tarefaDTORequest;
import com.henrique.listatarefas.Service.serviceTarefas;
import java.util.List;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

@RestController
@RequestMapping("/api/tarefas")
@CrossOrigin(origins = "*")


public class controllerTarefas {
    private final serviceTarefas service;

    public controllerTarefas(serviceTarefas service){
        this.service = service;
    }

    //GET /api/tarefas
    @GetMapping
    public ResponseEntity<List<tarefaDTOResponse>> listarTarefas(){
        return ResponseEntity.ok(service.listarTodas());
    }


    //GET api/tarefas/id
    @GetMapping("/{id}")
    public ResponseEntity<tarefaDTOResponse> buscarPorId(@PathVariable Long id){
        return  ResponseEntity.ok(service.buscarPorId(id));
    }


    //POST /api/tarefas
    @PostMapping
    public ResponseEntity<tarefaDTOResponse> criar(@Valid @RequestBody tarefaDTORequest dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.criar(dto));
    }


    //PUT /api/tarefas/id
    @PutMapping("/{id}")
    public ResponseEntity<tarefaDTOResponse> atualizar (
            @PathVariable Long id,
            @Valid @RequestBody tarefaDTORequest dto) {
        return ResponseEntity.ok(service.atualizar(id, dto));
    }


    //PATCH /api/tarefas/id/toggle
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<tarefaDTOResponse> alternarCompleta (@PathVariable Long id) {
        return ResponseEntity.ok(service.alternarCompleta(id));
    }


    //DELETE /api/tarefas/id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
