import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Image, Badge, InputGroup, Form } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Acervo = () => {
  const [livros, setLivros] = useState([]);
  const [busca, setBusca] = useState('');
  const navigate = useNavigate();

  const carregarLivros = async () => {
    try {
      const res = await axios.get('http://localhost:3001/livros');
      setLivros(res.data);
    } catch (err) {
      console.error("Erro ao carregar acervo", err);
    }
  };

  useEffect(() => { carregarLivros(); }, []);

  // Filtro de busca simples no frontend
  const livrosFiltrados = livros.filter((l: any) => 
    l.titulo.toLowerCase().includes(busca.toLowerCase()) || 
    l.isbn.includes(busca)
  );

  return (
    <Container className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📚 Acervo da Biblioteca</h2>
        <Button variant="primary" onClick={() => navigate('/adicionar-livro')}>
          + Adicionar Livro (ISBN)
        </Button>
      </div>

      <InputGroup className="mb-4 shadow-sm">
        <Form.Control
          placeholder="Buscar por título ou ISBN..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
      </InputGroup>

      <Table hover responsive className="shadow-sm bg-white">
        <thead className="table-dark">
          <tr>
            <th>Capa</th>
            <th>Título / Autor</th>
            <th>ISBN</th>
            <th>Qtd</th>
            <th className="text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {livrosFiltrados.map((livro: any) => (
            <tr key={livro.id} className="align-middle">
              <td style={{ width: '80px' }}>
                <Image 
                  src={livro.capaUrl || 'https://via.placeholder.com/50x75?text=Sem+Capa'} 
                  thumbnail 
                  style={{ width: '50px' }}
                />
              </td>
              <td>
                <strong>{livro.titulo}</strong><br />
                <small className="text-muted">{livro.autor}</small>
              </td>
              <td><Badge bg="secondary">{livro.isbn}</Badge></td>
              <td>{livro.quantidade}</td>
              <td className="text-center">
                <Button variant="outline-success" size="sm" className="me-2">
                  Emprestar
                </Button>
                <Button variant="outline-danger" size="sm">
                  Excluir
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};

export default Acervo;