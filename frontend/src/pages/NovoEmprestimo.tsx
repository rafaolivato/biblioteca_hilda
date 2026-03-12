import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NovoEmprestimo = () => {
  const [alunos, setAlunos] = useState([]);
  const [livros, setLivros] = useState([]);
  const [selecionados, setSelecionados] = useState({ alunoId: '', livroId: '' });
  const [msg, setMsg] = useState({ tipo: '', texto: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const carregarDados = async () => {
      const [resAlunos, resLivros] = await Promise.all([
        axios.get('http://localhost:3001/usuarios/alunos'),
        axios.get('http://localhost:3001/livros')
      ]);
      setAlunos(resAlunos.data);
      setLivros(resLivros.data.filter((l: any) => l.quantidade > 0)); // Só livros em estoque
    };
    carregarDados();
  }, []);

  const realizarEmprestimo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/emprestimos', {
        usuarioId: selecionados.alunoId,
        livroId: selecionados.livroId
      });
      setMsg({ tipo: 'success', texto: 'Empréstimo realizado com sucesso!' });
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (err) {
      setMsg({ tipo: 'danger', texto: 'Erro ao processar empréstimo.' });
    }
  };

  return (
    <Container className="mt-4">
      <Card className="shadow border-0 p-4">
        <h3>Registrar Empréstimo</h3>
        <Form onSubmit={realizarEmprestimo}>
          <Form.Group className="mb-3">
            <Form.Label>Selecionar Aluno</Form.Label>
            <Form.Select 
              required 
              onChange={e => setSelecionados({...selecionados, alunoId: e.target.value})}
            >
              <option value="">Escolha o aluno...</option>
              {alunos.map((a: any) => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label>Selecionar Livro</Form.Label>
            <Form.Select 
              required 
              onChange={e => setSelecionados({...selecionados, livroId: e.target.value})}
            >
              <option value="">Escolha o livro...</option>
              {livros.map((l: any) => <option key={l.id} value={l.id}>{l.titulo} (ISBN: {l.isbn})</option>)}
            </Form.Select>
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
            Confirmar Empréstimo
          </Button>
        </Form>
        {msg.texto && <Alert variant={msg.tipo} className="mt-3">{msg.texto}</Alert>}
      </Card>
    </Container>
  );
};

export default NovoEmprestimo;