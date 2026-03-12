import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Badge, Alert } from 'react-bootstrap';
import axios from 'axios';

const ControleEmprestimos = () => {
  const [emprestimos, setEmprestimos] = useState([]);
  const [status, setStatus] = useState({ tipo: '', texto: '' });

  const carregarEmprestimos = async () => {
    try {
      const res = await axios.get('http://localhost:3001/emprestimos/ativos');
      setEmprestimos(res.data);
    } catch (err) {
      console.error("Erro ao carregar empréstimos", err);
    }
  };

  useEffect(() => { carregarEmprestimos(); }, []);

  const handleDevolucao = async (id: string) => {
    try {
      await axios.put(`http://localhost:3001/emprestimos/devolver/${id}`);
      setStatus({ tipo: 'success', texto: 'Livro devolvido e estoque atualizado!' });
      carregarEmprestimos(); // Recarrega a lista
    } catch (err) {
      setStatus({ tipo: 'danger', texto: 'Erro ao processar devolução.' });
    }
  };

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Livros em Empréstimo</h2>
      
      {status.texto && <Alert variant={status.tipo} dismissible onClose={() => setStatus({tipo:'', texto:''})}>{status.texto}</Alert>}

      <Table hover responsive className="shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Aluno</th>
            <th>Livro</th>
            <th>Data Empréstimo</th>
            <th className="text-center">Ação</th>
          </tr>
        </thead>
        <tbody>
          {emprestimos.length === 0 ? (
            <tr><td colSpan={4} className="text-center">Nenhum empréstimo ativo no momento.</td></tr>
          ) : (
            emprestimos.map((emp: any) => (
              <tr key={emp.id} className="align-middle">
                <td>{emp.usuario.nome}</td>
                <td>
                  <strong>{emp.livro.titulo}</strong><br/>
                  <small className="text-muted">ISBN: {emp.livro.isbn}</small>
                </td>
                <td>{new Date(emp.dataEmprestimo).toLocaleDateString('pt-BR')}</td>
                <td className="text-center">
                  <Button 
                    variant="success" 
                    size="sm" 
                    onClick={() => handleDevolucao(emp.id)}
                  >
                    Dar Baixa / Devolver
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </Container>
  );
};

export default ControleEmprestimos;