import React, { useState, useEffect } from 'react';
import { Container, Table, Form, Button, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('123456'); // Senha padrão para alunos

  const fetchUsuarios = async () => {
    const res = await axios.get('http://localhost:3001/usuarios/alunos');
    setUsuarios(res.data);
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const cadastrarAluno = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.post('http://localhost:3001/usuarios', { nome, email, senha, role: 'USER' });
    setNome(''); setEmail('');
    fetchUsuarios();
  };

  return (
    <Container className="mt-4">
      <Card className="p-4 mb-4 shadow-sm border-0">
        <h4>Cadastrar Novo Aluno</h4>
        <Form onSubmit={cadastrarAluno}>
          <Row>
            <Col md={5}><Form.Control placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required /></Col>
            <Col md={5}><Form.Control type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required /></Col>
            <Col md={2}><Button type="submit" variant="success" className="w-100">Cadastrar</Button></Col>
          </Row>
        </Form>
      </Card>

      <Table striped bordered hover responsive>
        <thead className="table-dark">
          <tr>
            <th>Nome</th>
            <th>E-mail</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u: any) => (
            <tr key={u.id}>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td><Button variant="outline-danger" size="sm">Excluir</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Usuarios;