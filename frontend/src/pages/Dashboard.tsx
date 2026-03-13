import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.css';
import axios from 'axios';
import logoHilda from '../assets/logo_hilda.jpg';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ livros: 0, alunos: 0, emprestimos: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(res.data);
      } catch (err) {
        console.error('Erro ao carregar dashboard', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <Container className="mt-4">
      {/* Cabeçalho com logo */}
      <div className="d-flex align-items-center mb-4 border-bottom pb-3">
        <img
          src={logoHilda}
          alt="Logo Biblioteca Hilda"
          style={{
            height: '70px',
            marginRight: '24px',
          }}
        />
        <h2 className="fw-bold text-primary m-0">
          Dashboard - Biblioteca Hilda
        </h2>
      </div>

      <Row>
        {/* Card de Livros */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-primary shadow border-0">
            <Card.Body className="text-center">
              <Card.Title>Total de Livros</Card.Title>
              <h1 className="display-4">{stats.livros}</h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/acervo')}>
                Ver Acervo
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card de Alunos */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-success shadow border-0">
            <Card.Body className="text-center">
              <Card.Title>Alunos Cadastrados</Card.Title>
              <h1 className="display-4">{stats.alunos}</h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => (window.location.href = '/usuarios')}>
                Gerenciar Alunos
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card de Novo Empréstimo */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-danger shadow border-0">
            <Card.Body className="text-center">
              <Card.Title>Novo Empréstimo</Card.Title>
              <h1 className="display-4">
                <i className="bi bi-journal-plus"></i>
              </h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/novo-emprestimo')}
              >
                Registrar Saída
              </Button>
            </Card.Body>
          </Card>
        </Col>

        {/* Card de Empréstimos */}
        <Col md={4} className="mb-3">
          <Card className="text-white bg-warning shadow border-0">
            <Card.Body className="text-center">
              <Card.Title>Empréstimos Ativos</Card.Title>
              <h1 className="display-4">{stats.emprestimos}</h1>
              <Button
                variant="outline-light"
                size="sm"
                onClick={() => navigate('/controle-emprestimos')}
              >
                Ver Prazos
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Sugestão: Espaço para a Busca */}
      <Row className="mt-5">
        <Col>
          <Card className="p-4 border-dashed">
            <h5 className="text-muted">Busca Rápida de Livros</h5>
            <p className="small">
              Dica: Use o ISBN para encontrar livros instantaneamente via Google
              Books.
            </p>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
