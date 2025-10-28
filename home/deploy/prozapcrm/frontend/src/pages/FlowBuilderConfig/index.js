import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { SiOpenai } from "react-icons/si";
import typebotIcon from "../../assets/typebot-ico.png";
import { HiOutlinePuzzle } from "react-icons/hi";

import { toast } from "react-toastify";
import {
  Box,
  Paper,
  Button,
  Stack,
  Typography,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  CircularProgress,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
  Chip,
  Card,
  CardContent,
  Fade,
  Slide,
  Zoom,
  Backdrop,
  Divider,
} from "@mui/material";
import {
  AccessTime,
  CallSplit,
  DynamicFeed,
  LibraryBooks,
  RocketLaunch,
  FileDownload,
  FileUpload,
  Save,
  BallotOutlined as BallotIcon,
  ConfirmationNumber,
  ZoomIn,
  ZoomOut,
  CenterFocusStrong,
  GridOn,
  GridOff,
  WarningAmber,
  Http,
  AutoAwesome,
  Timeline,
  AccountTree,
  Memory,
  Speed,
  Palette,
  Fullscreen,
  FullscreenExit,
} from "@mui/icons-material";

import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";

import audioNode from "./nodes/audioNode";
import typebotNode from "./nodes/typebotNode";
import openaiNode from "./nodes/openaiNode";
import messageNode from "./nodes/messageNode.js";
import startNode from "./nodes/startNode";
import menuNode from "./nodes/menuNode";
import intervalNode from "./nodes/intervalNode";
import imgNode from "./nodes/imgNode";
import randomizerNode from "./nodes/randomizerNode";
import videoNode from "./nodes/videoNode";
import questionNode from "./nodes/questionNode";
import singleBlockNode from "./nodes/singleBlockNode";
import ticketNode from "./nodes/ticketNode";
import RemoveEdge from "./nodes/removeEdge";
import httpRequestNode from "./nodes/httpRequestNode";
import FlowBuilderHttpRequestModal from "../../components/FlowBuilderHttpRequestModal";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useNodeStorage } from "../../stores/useNodeStorage";

import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import FlowBuilderAddTextModal from "../../components/FlowBuilderAddTextModal";
import FlowBuilderIntervalModal from "../../components/FlowBuilderIntervalModal";
import FlowBuilderConditionModal from "../../components/FlowBuilderConditionModal";
import FlowBuilderMenuModal from "../../components/FlowBuilderMenuModal";
import FlowBuilderAddImgModal from "../../components/FlowBuilderAddImgModal";
import FlowBuilderTicketModal from "../../components/FlowBuilderAddTicketModal";
import FlowBuilderAddAudioModal from "../../components/FlowBuilderAddAudioModal";
import FlowBuilderRandomizerModal from "../../components/FlowBuilderRandomizerModal";
import FlowBuilderAddVideoModal from "../../components/FlowBuilderAddVideoModal";
import FlowBuilderSingleBlockModal from "../../components/FlowBuilderSingleBlockModal";
import FlowBuilderTypebotModal from "../../components/FlowBuilderAddTypebotModal";
import FlowBuilderOpenAIModal from "../../components/FlowBuilderAddOpenAIModal";
import FlowBuilderAddQuestionModal from "../../components/FlowBuilderAddQuestionModal";

import "reactflow/dist/style.css";
import { colorPrimary } from "../../styles/styles";

// Função para gerar ID aleatório
function geraStringAleatoria(tamanho) {
  var stringAleatoria = "";
  var caracteres =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (var i = 0; i < tamanho; i++) {
    stringAleatoria += caracteres.charAt(
      Math.floor(Math.random() * caracteres.length)
    );
  }
  return stringAleatoria;
}

// Definição dos tipos de nós
const nodeTypes = {
  message: messageNode,
  start: startNode,
  menu: menuNode,
  interval: intervalNode,
  img: imgNode,
  audio: audioNode,
  randomizer: randomizerNode,
  video: videoNode,
  singleBlock: singleBlockNode,
  ticket: ticketNode,
  typebot: typebotNode,
  openai: openaiNode,
  question: questionNode,
  httpRequest: httpRequestNode,
};

// Definição dos tipos de conexões
const edgeTypes = {
  buttonedge: RemoveEdge,
};

// Nó inicial
const initialNodes = [
  {
    id: "1",
    position: { x: 250, y: 100 },
    data: { label: "Inicio do fluxo" },
    type: "start",
  },
];

const initialEdges = [];

export const FlowBuilderConfig = () => {
  const history = useHistory();
  const { id } = useParams();
  const storageItems = useNodeStorage();
  const { user } = useContext(AuthContext);
  const systemTheme = useTheme();
  const isDark = systemTheme.palette.mode === "dark";

  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [dataNode, setDataNode] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [modalAddText, setModalAddText] = useState(null);
  const [modalAddInterval, setModalAddInterval] = useState(false);
  const [modalAddMenu, setModalAddMenu] = useState(null);
  const [modalAddImg, setModalAddImg] = useState(null);
  const [modalAddAudio, setModalAddAudio] = useState(null);
  const [modalAddRandomizer, setModalAddRandomizer] = useState(null);
  const [modalAddVideo, setModalAddVideo] = useState(null);
  const [modalAddSingleBlock, setModalAddSingleBlock] = useState(null);
  const [modalAddTicket, setModalAddTicket] = useState(null);
  const [modalAddTypebot, setModalAddTypebot] = useState(null);
  const [modalAddOpenAI, setModalAddOpenAI] = useState(null);
  const [modalAddQuestion, setModalAddQuestion] = useState(null);
  const [modalAddHttpRequest, setModalAddHttpRequest] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [nodeCount, setNodeCount] = useState(1);
  const [edgeCount, setEdgeCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleNodeAction = (nodeId, action) => {
    storageItems.setNodesStorage(nodeId);
    storageItems.setAct(action);
  };

  // Estilos modernos para o tema
  const modernStyles = {
    background: isDark
      ? `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)`
      : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)`,

    glassmorphism: {
      background: isDark
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(20px)",
      border: isDark
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.3)",
      borderRadius: "20px",
      boxShadow: isDark
        ? "0 20px 40px rgba(0,0,0,0.4)"
        : "0 20px 40px rgba(0,0,0,0.1)",
    },

    neonGlow: {
      boxShadow: isDark
        ? "0 0 20px rgba(59, 130, 246, 0.5), 0 0 40px rgba(59, 130, 246, 0.3)"
        : "0 0 20px rgba(59, 130, 246, 0.2), 0 0 40px rgba(59, 130, 246, 0.1)",
    },
  };

  // Estilos de conexão modernos
  const connectionLineStyle = {
    stroke: isDark ? "#3b82f6" : "#1e40af",
    strokeWidth: "3px",
    filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))",
  };

  // Estados para os nós e conexões do fluxo
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Callback para conectar nós com animação
  const onConnect = useCallback(
    (params) => {
      if (params.source === params.target) {
        console.warn(
          "Conexão inválida: não é possível conectar um nó a si mesmo."
        );
        return;
      }
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "buttonedge",
            animated: true,
            style: {
              stroke: isDark ? "#3b82f6" : "#1e40af",
              strokeWidth: "3px",
              filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))",
            },
          },
          eds
        )
      );
      setHasUnsavedChanges(true);
      setEdgeCount((prev) => prev + 1);
    },
    [setEdges, isDark]
  );

  // Função para adicionar um novo nó
  const addNode = (type, data) => {
    const posY = nodes[nodes.length - 1].position.y;
    const posX =
      nodes[nodes.length - 1].position.x +
      (nodes[nodes.length - 1].width || 200) +
      40;

    let newNode;

    switch (type) {
      case "start":
        newNode = {
          id: "1",
          position: { x: posX, y: posY },
          data: { label: "Inicio do fluxo" },
          type: "start",
        };
        setNodes([newNode]);
        break;
      case "text":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { label: data.text },
          type: "message",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "interval":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { label: `Intervalo ${data.sec} seg.`, sec: data.sec },
          type: "interval",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "menu":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: {
            message: data.message,
            arrayOption: data.arrayOption,
          },
          type: "menu",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "img":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url },
          type: "img",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "audio":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url, record: data.record },
          type: "audio",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "randomizer":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { percent: data.percent },
          type: "randomizer",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "video":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url },
          type: "video",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "singleBlock":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "singleBlock",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "ticket":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "ticket",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "typebot":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "typebot",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "openai":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "openai",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "question":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { ...data },
          type: "question",
        };
        setNodes((old) => [...old, newNode]);
        break;
      case "httpRequest":
        newNode = {
          id: geraStringAleatoria(30),
          position: { x: posX, y: posY },
          data: { url: data.url, method: data.method, label: data.label },
          type: "httpRequest",
        };
        setNodes((old) => [...old, newNode]);
        break;
      default:
        break;
    }

    setHasUnsavedChanges(true);
    setNodeCount((prev) => prev + 1);
  };

  // Funções handlers para cada tipo de nó
  const textAdd = (data) => addNode("text", data);
  const intervalAdd = (data) => addNode("interval", data);
  const conditionAdd = (data) => addNode("condition", data);
  const menuAdd = (data) => addNode("menu", data);
  const imgAdd = (data) => addNode("img", data);
  const audioAdd = (data) => addNode("audio", data);
  const randomizerAdd = (data) => addNode("randomizer", data);
  const videoAdd = (data) => addNode("video", data);
  const singleBlockAdd = (data) => addNode("singleBlock", data);
  const ticketAdd = (data) => addNode("ticket", data);
  const typebotAdd = (data) => addNode("typebot", data);
  const openaiAdd = (data) => addNode("openai", data);
  const questionAdd = (data) => addNode("question", data);
  const httpRequestAdd = (data) => addNode("httpRequest", data);

  // Carregar fluxo existente
  useEffect(() => {
    setLoading(true);
    const fetchFlow = async () => {
      try {
        const { data } = await api.get(`/flowbuilder/flow/${id}`);
        if (data.flow.flow !== null) {
          const flowNodes = data.flow.flow.nodes;
          setNodes(flowNodes);
          setEdges(data.flow.flow.connections);

          const filterVariables = flowNodes.filter(
            (nd) => nd.type === "question"
          );
          const variables = filterVariables
            .map((variable) => variable.data.typebotIntegration?.answerKey)
            .filter(Boolean);

          localStorage.setItem("variables", JSON.stringify(variables));
          setNodeCount(flowNodes.length);
          setEdgeCount(data.flow.flow.connections.length);
        }
        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    };
    fetchFlow();
  }, [id]);

  // Efeito para ação de nós (excluir, duplicar)
  useEffect(() => {
    if (storageItems.action === "delete") {
      setNodes((old) => old.filter((item) => item.id !== storageItems.node));
      setEdges((old) => {
        const newData = old.filter((item) => item.source !== storageItems.node);
        const newClearTarget = newData.filter(
          (item) => item.target !== storageItems.node
        );
        return newClearTarget;
      });
      storageItems.setNodesStorage("");
      storageItems.setAct("idle");
      setHasUnsavedChanges(true);
      setNodeCount((prev) => prev - 1);
      setTimeout(() => {
        setEdgeCount(edges.length);
      }, 100);
    }
    if (storageItems.action === "duplicate") {
      const nodeDuplicate = nodes.filter(
        (item) => item.id === storageItems.node
      )[0];

      if (nodeDuplicate) {
        const maioresX = nodes.map((node) => node.position.x);
        const maiorX = Math.max(...maioresX);
        const finalY = nodes[nodes.length - 1].position.y;
        const nodeNew = {
          ...nodeDuplicate,
          id: geraStringAleatoria(30),
          position: {
            x: maiorX + 240,
            y: finalY,
          },
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 8,
          },
        };
        setNodes((old) => [...old, nodeNew]);
        storageItems.setNodesStorage("");
        storageItems.setAct("idle");
        setHasUnsavedChanges(true);
        setNodeCount((prev) => prev + 1);
      }
    }
  }, [storageItems.action]);

  useEffect(() => {
    const handleRemoveEdge = (event) => {
      const { id } = event.detail;
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
      setHasUnsavedChanges(true);
      setEdgeCount((prev) => prev - 1);
    };

    window.addEventListener("removeEdge", handleRemoveEdge);
    return () => window.removeEventListener("removeEdge", handleRemoveEdge);
  }, [setEdges]);

  // Carregar mais fluxos
  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  // Handler para scroll
  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  // Salvar fluxo
  const saveFlow = async () => {
    setSaveLoading(true);
    try {
      await api.post("/flowbuilder/flow", {
        idFlow: id,
        nodes: nodes,
        connections: edges,
      });
      toast.success("Fluxo salvo com sucesso");
      setHasUnsavedChanges(false);
    } catch (err) {
      toastError(err);
    } finally {
      setSaveLoading(false);
    }
  };

  // Double click em um nó
  const doubleClick = (event, node) => {
    setDataNode(node);
    switch (node.type) {
      case "message":
        setModalAddText("edit");
        break;
      case "interval":
        setModalAddInterval("edit");
        break;
      case "menu":
        setModalAddMenu("edit");
        break;
      case "img":
        setModalAddImg("edit");
        break;
      case "audio":
        setModalAddAudio("edit");
        break;
      case "randomizer":
        setModalAddRandomizer("edit");
        break;
      case "singleBlock":
        setModalAddSingleBlock("edit");
        break;
      case "ticket":
        setModalAddTicket("edit");
        break;
      case "typebot":
        setModalAddTypebot("edit");
        break;
      case "openai":
        setModalAddOpenAI("edit");
        break;
      case "question":
        setModalAddQuestion("edit");
        break;
      case "httpRequest":
        setModalAddHttpRequest("edit");
        break;
      default:
        break;
    }
  };

  // Click em um nó
  const clickNode = (event, node) => {
    setNodes((old) =>
      old.map((item) => {
        if (item.id === node.id) {
          return {
            ...item,
            selected: true,
            style: {
              borderColor: "#3b82f6",
              borderWidth: 3,
              borderStyle: "solid",
              borderRadius: 12,
              boxShadow: "0 0 20px rgba(59, 130, 246, 0.6)",
            },
          };
        }
        return {
          ...item,
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 12,
          },
        };
      })
    );
  };

  // Click em uma conexão
  const clickEdge = (event, edge) => {
    setNodes((old) =>
      old.map((item) => {
        return {
          ...item,
          selected: false,
          style: {
            borderColor: "transparent",
            borderWidth: 2,
            borderStyle: "solid",
            borderRadius: 12,
          },
        };
      })
    );
  };

  // Atualizar nó
  const updateNode = (dataAlter) => {
    setNodes((old) =>
      old.map((itemNode) => {
        if (itemNode.id === dataAlter.id) {
          return dataAlter;
        }
        return itemNode;
      })
    );
    setModalAddText(null);
    setModalAddInterval(null);
    setModalAddMenu(null);
    setModalAddOpenAI(null);
    setModalAddTypebot(null);
    setModalAddQuestion(null);
    setModalAddImg(null);
    setModalAddAudio(null);
    setModalAddRandomizer(null);
    setModalAddVideo(null);
    setModalAddSingleBlock(null);
    setModalAddTicket(null);
    setModalAddHttpRequest(null);
    setHasUnsavedChanges(true);
  };

  // Ações modernizadas do SpeedDial
  const actions = [
    {
      icon: <RocketLaunch />,
      name: "Inicio",
      type: "start",
      color: "#3B82F6", // Blue
    },
    {
      icon: <LibraryBooks />,
      name: "Conteúdo",
      type: "content",
      color: "#EC4899", // Pink
    },
    {
      icon: <DynamicFeed />,
      name: "Menu",
      type: "menu",
      color: "#10B981", // Green
    },
    {
      icon: <CallSplit />,
      name: "Randomizador",
      type: "random",
      color: "#F59E0B", // Amber
    },
    {
      icon: <AccessTime />,
      name: "Intervalo",
      type: "interval",
      color: "#8B5CF6", // Purple
    },
    {
      icon: <ConfirmationNumber />,
      name: "Ticket",
      type: "ticket",
      color: "#06B6D4", // Cyan
    },
    {
      icon: (
        <Box
          component="img"
          sx={{
            width: 24,
            height: 24,
          }}
          src={typebotIcon}
          alt="icon"
        />
      ),
      name: "TypeBot",
      type: "typebot",
      color: "#3B82F6", // Blue
    },
    {
      icon: <SiOpenai style={{ fontSize: 20 }} />,
      name: "OpenAI",
      type: "openai",
      color: "#F97316", // Orange
    },
    {
      icon: <BallotIcon />,
      name: "Pergunta",
      type: "question",
      color: "#EF4444", // Red
    },
    {
      icon: <Http />,
      name: "HTTP Request",
      type: "httpRequest",
      color: "#6366F1", // Indigo
    },
  ];

  // Handlers para ações do SpeedDial
  const clickActions = (type) => {
    switch (type) {
      case "start":
        addNode("start");
        break;
      case "menu":
        setModalAddMenu("create");
        break;
      case "content":
        setModalAddSingleBlock("create");
        break;
      case "random":
        setModalAddRandomizer("create");
        break;
      case "interval":
        setModalAddInterval("create");
        break;
      case "ticket":
        setModalAddTicket("create");
        break;
      case "typebot":
        setModalAddTypebot("create");
        break;
      case "openai":
        setModalAddOpenAI("create");
        break;
      case "question":
        setModalAddQuestion("create");
        break;
      case "httpRequest":
        setModalAddHttpRequest("create");
        break;
      default:
        break;
    }
  };

  // Exportar fluxo
  const handleExportFlow = async () => {
    try {
      const flowData = {
        nodes,
        edges,
      };

      const blob = new Blob([JSON.stringify(flowData, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `flow-${id}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Fluxo exportado com sucesso!");
    } catch (err) {
      toastError(err);
    }
  };

  // Importar fluxo
  const handleImportFlow = async (file) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const flowData = JSON.parse(e.target.result);
        setNodes(flowData.nodes);
        setEdges(flowData.edges);
        toast.success("Fluxo importado com sucesso!");
        setHasUnsavedChanges(true);
        setNodeCount(flowData.nodes.length);
        setEdgeCount(flowData.edges.length);
      };
      reader.readAsText(file);
    } catch (err) {
      toastError(err);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Componente principal modernizado
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: modernStyles.background,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Modais */}
      <FlowBuilderAddTextModal
        open={modalAddText}
        onSave={textAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddText}
      />
      <FlowBuilderIntervalModal
        open={modalAddInterval}
        onSave={intervalAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddInterval}
      />
      <FlowBuilderMenuModal
        open={modalAddMenu}
        onSave={menuAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddMenu}
      />
      <FlowBuilderAddImgModal
        open={modalAddImg}
        onSave={imgAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddImg}
      />
      <FlowBuilderAddAudioModal
        open={modalAddAudio}
        onSave={audioAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddAudio}
      />
      <FlowBuilderRandomizerModal
        open={modalAddRandomizer}
        onSave={randomizerAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddRandomizer}
      />
      <FlowBuilderAddVideoModal
        open={modalAddVideo}
        onSave={videoAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddVideo}
      />
      <FlowBuilderSingleBlockModal
        open={modalAddSingleBlock}
        onSave={singleBlockAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddSingleBlock}
      />
      <FlowBuilderTicketModal
        open={modalAddTicket}
        onSave={ticketAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTicket}
      />
      <FlowBuilderTypebotModal
        open={modalAddTypebot}
        onSave={typebotAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddTypebot}
      />
      <FlowBuilderOpenAIModal
        open={modalAddOpenAI}
        onSave={openaiAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddOpenAI}
      />
      <FlowBuilderAddQuestionModal
        open={modalAddQuestion}
        onSave={questionAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddQuestion}
      />
      <FlowBuilderHttpRequestModal
        open={modalAddHttpRequest}
        onSave={httpRequestAdd}
        data={dataNode}
        onUpdate={updateNode}
        close={setModalAddHttpRequest}
      />

      {/* Header modernizado com glassmorphism */}
      <Slide direction="down" in={true} timeout={800}>
        <Card
          sx={{
            ...modernStyles.glassmorphism,
            margin: "16px",
            marginBottom: "8px",
            borderRadius: "24px",
            position: "relative",
            zIndex: 100,
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                    borderRadius: "16px",
                    p: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...modernStyles.neonGlow,
                  }}
                >
                  <AccountTree sx={{ color: "white", fontSize: 28 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 800,
                      background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                      backgroundClip: "text",
                      WebkitBackgroundClip: "text",
                      color: "transparent",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    Flowbuilder
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      color: isDark
                        ? "rgba(255,255,255,0.7)"
                        : "rgba(0,0,0,0.6)",
                      fontWeight: 500,
                    }}
                  >
                    Construa fluxos inteligentes e modernos
                  </Typography>
                </Box>
              </Box>

              {/* Status chips modernizados */}
              <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
                {hasUnsavedChanges && (
                  <Zoom in={hasUnsavedChanges} timeout={300}>
                    <Chip
                      icon={<AutoAwesome sx={{ fontSize: 18 }} />}
                      label="Alterações não salvas"
                      size="medium"
                      sx={{
                        background: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)`,
                        color: "white",
                        fontWeight: 600,
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(250, 112, 154, 0.4)",
                        "& .MuiChip-icon": { color: "white" },
                      }}
                    />
                  </Zoom>
                )}

                <Chip
                  icon={<Timeline sx={{ fontSize: 18 }} />}
                  label={`${nodeCount} Nós`}
                  size="medium"
                  sx={{
                    background: isDark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "rgba(59, 130, 246, 0.1)",
                    color: "#3b82f6",
                    fontWeight: 600,
                    borderRadius: "12px",
                    border: "1px solid rgba(59, 130, 246, 0.3)",
                    "& .MuiChip-icon": { color: "#3b82f6" },
                  }}
                />

                <Chip
                  icon={<Memory sx={{ fontSize: 18 }} />}
                  label={`${edgeCount} Conexões`}
                  size="medium"
                  sx={{
                    background: isDark
                      ? "rgba(156, 39, 176, 0.2)"
                      : "rgba(156, 39, 176, 0.1)",
                    color: "#9c27b0",
                    fontWeight: 600,
                    borderRadius: "12px",
                    border: "1px solid rgba(156, 39, 176, 0.3)",
                    "& .MuiChip-icon": { color: "#9c27b0" },
                  }}
                />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Slide>

      {/* Conteúdo principal */}
      {loading ? (
        <Fade in={loading} timeout={600}>
          <Stack
            justifyContent="center"
            alignItems="center"
            height="70vh"
            spacing={3}
          >
            <Box
              sx={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={80}
                thickness={4}
                sx={{
                  color: "#667eea",
                  filter: "drop-shadow(0 0 10px rgba(102, 126, 234, 0.6))",
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  borderRadius: "50%",
                  p: 2,
                }}
              >
                <Speed sx={{ color: "white", fontSize: 32 }} />
              </Box>
            </Box>
            <Typography
              variant="h6"
              sx={{
                color: isDark ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.7)",
                fontWeight: 600,
              }}
            >
              Carregando seu fluxo...
            </Typography>
          </Stack>
        </Fade>
      ) : (
        <Fade in={!loading} timeout={800}>
          <Card
            sx={{
              flex: 1,
              position: "relative",
              ...modernStyles.glassmorphism,
              margin: "8px 16px 16px 16px",
              borderRadius: "24px",
              overflow: "hidden",
              backdropFilter: "blur(20px)",
            }}
            onScroll={handleScroll}
          >
            {/* Notification floating modernizada */}
            <Slide direction="down" in={true} timeout={1000}>
              <Box
                sx={{
                  position: "absolute",
                  top: "24px",
                  left: "20%",
                  transform: "translateX(-50%)",
                  zIndex: 10,
                  ...modernStyles.glassmorphism,
                  borderRadius: "16px",
                  py: 1.5,
                  px: 3,
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <Palette sx={{ color: "#667eea", fontSize: 20 }} />
                <Typography
                  sx={{
                    color: isDark ? "rgba(255,255,255,0.9)" : "rgba(0,0,0,0.8)",
                    fontWeight: 600,
                    fontSize: "14px",
                  }}
                >
                  💡 Dica: Duplo clique para editar nós • Arraste para conectar
                </Typography>
              </Box>
            </Slide>

            <SpeedDial
              ariaLabel="Menu de ações"
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                zIndex: 1000,
                display: "flex",
                "& .MuiFab-primary": {
                  background: isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "rgba(255, 255, 255, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: isDark
                    ? "1px solid rgba(255, 255, 255, 0.1)"
                    : "1px solid rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  width: 56,
                  height: 56,
                  boxShadow: isDark
                    ? "0 4px 12px rgba(0,0,0,0.3)"
                    : "0 4px 12px rgba(0,0,0,0.08)",
                  color: isDark ? "#FFFFFF" : "#1F2A44",
                  "&:hover": {
                    background: isDark
                      ? "rgba(255, 255, 255, 0.1)"
                      : "rgba(255, 255, 255, 0.9)",
                    transform: "scale(1.1)",
                    boxShadow: isDark
                      ? "0 6px 16px rgba(0,0,0,0.4)"
                      : "0 6px 16px rgba(0,0,0,0.12)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
              }}
              icon={<SpeedDialIcon sx={{ fontSize: 24 }} />}
              direction="down"
            >
              {actions.map((action, index) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={
                    <Typography
                      sx={{
                        px: 2,
                        py: 1,
                        fontWeight: 600,
                        fontSize: 14,
                        color: isDark ? "#FFFFFF" : "#1F2A44",
                      }}
                    >
                      {action.name}
                    </Typography>
                  }
                  tooltipOpen
                  tooltipPlacement="right"
                  onClick={() => clickActions(action.type)}
                  sx={{
                    "& .MuiSpeedDialAction-fab": {
                      background: action.color,
                      color: "#FFFFFF",
                      width: 48,
                      height: 48,
                      borderRadius: "12px",
                      boxShadow: `0 4px 12px ${alpha(action.color, 0.4)}`,
                      "&:hover": {
                        transform: "scale(1.1)",
                        boxShadow: `0 6px 16px ${alpha(action.color, 0.6)}`,
                      },
                      transition: `all 0.3s cubic-bezier(0.4, 0, 0.2, 1) ${
                        index * 50
                      }ms`,
                    },
                    "& .MuiSpeedDialAction-staticTooltipLabel": {
                      background: isDark
                        ? "rgba(255, 255, 255, 0.05)"
                        : "rgba(255, 255, 255, 0.8)",
                      backdropFilter: "blur(10px)",
                      border: isDark
                        ? "1px solid rgba(255, 255, 255, 0.1)"
                        : "1px solid rgba(0, 0, 0, 0.1)",
                      borderRadius: "12px",
                      boxShadow: isDark
                        ? "0 4px 12px rgba(0,0,0,0.3)"
                        : "0 4px 12px rgba(0,0,0,0.08)",
                    },
                  }}
                />
              ))}
            </SpeedDial>

            {/* Botões de ação modernizados */}
            <Slide direction="left" in={true} timeout={800}>
              <Stack
                direction="row"
                spacing={2}
                sx={{
                  position: "absolute",
                  top: 24,
                  right: 24,
                  zIndex: 10,
                }}
              >
                <input
                  type="file"
                  id="import-flow-builder"
                  accept=".json"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files?.length) {
                      handleImportFlow(e.target.files[0]);
                      e.target.value = "";
                    }
                  }}
                />

                <Tooltip title="Alternar tela cheia" placement="bottom">
                  <IconButton
                    onClick={toggleFullscreen}
                    sx={{
                      ...modernStyles.glassmorphism,
                      borderRadius: "16px",
                      p: 1.5,
                      color: "#667eea",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        ...modernStyles.neonGlow,
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {isFullscreen ? (
                      <FullscreenExit sx={{ fontSize: 24 }} />
                    ) : (
                      <Fullscreen sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>
                </Tooltip>

                <Tooltip title="Alternar grid" placement="bottom">
                  <IconButton
                    onClick={() => setShowGrid(!showGrid)}
                    sx={{
                      ...modernStyles.glassmorphism,
                      borderRadius: "16px",
                      p: 1.5,
                      color: "#667eea",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        ...modernStyles.neonGlow,
                      },
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {showGrid ? (
                      <GridOff sx={{ fontSize: 24 }} />
                    ) : (
                      <GridOn sx={{ fontSize: 24 }} />
                    )}
                  </IconButton>
                </Tooltip>

                <Button
                  variant="contained"
                  onClick={() =>
                    document.getElementById("import-flow-builder").click()
                  }
                  startIcon={<FileUpload sx={{ fontSize: 20 }} />}
                  sx={{
                    background: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)`,
                    color: "white",
                    fontWeight: 600,
                    borderRadius: "16px",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(79, 172, 254, 0.4)",
                    border: "none",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 35px rgba(79, 172, 254, 0.6)",
                      background: `linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)`,
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Importar
                </Button>

                <Button
                  variant="contained"
                  onClick={handleExportFlow}
                  startIcon={<FileDownload sx={{ fontSize: 20 }} />}
                  sx={{
                    background: `linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)`,
                    color: "#4a5568",
                    fontWeight: 600,
                    borderRadius: "16px",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    boxShadow: "0 8px 25px rgba(168, 237, 234, 0.4)",
                    border: "none",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 12px 35px rgba(168, 237, 234, 0.6)",
                      background: `linear-gradient(135deg, #fed6e3 0%, #a8edea 100%)`,
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  Exportar
                </Button>

                <Button
                  variant="contained"
                  onClick={saveFlow}
                  disabled={saveLoading}
                  startIcon={
                    saveLoading ? (
                      <CircularProgress size={20} sx={{ color: "white" }} />
                    ) : (
                      <Save sx={{ fontSize: 20 }} />
                    )
                  }
                  sx={{
                    background: hasUnsavedChanges
                      ? `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                      : `linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%)`,
                    color: hasUnsavedChanges ? "white" : "#667eea",
                    fontWeight: 600,
                    borderRadius: "16px",
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    boxShadow: hasUnsavedChanges
                      ? "0 8px 25px rgba(102, 126, 234, 0.4)"
                      : "0 4px 15px rgba(0, 0, 0, 0.1)",
                    border: hasUnsavedChanges
                      ? "none"
                      : "1px solid rgba(102, 126, 234, 0.3)",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: hasUnsavedChanges
                        ? "0 12px 35px rgba(102, 126, 234, 0.6)"
                        : "0 8px 25px rgba(102, 126, 234, 0.3)",
                      background: hasUnsavedChanges
                        ? `linear-gradient(135deg, #764ba2 0%, #667eea 100%)`
                        : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                      color: "white",
                    },
                    "&:disabled": {
                      background: "rgba(0, 0, 0, 0.12)",
                      color: "rgba(0, 0, 0, 0.26)",
                      transform: "none",
                    },
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {saveLoading ? "Salvando..." : "Salvar Fluxo"}
                </Button>
              </Stack>
            </Slide>

            {/* Área do fluxo modernizada */}
            <Box
              sx={{
                width: "100%",
                height: "100%",
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
              }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                deleteKeyCode={["Backspace", "Delete"]}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={doubleClick}
                onNodeClick={clickNode}
                onEdgeClick={clickEdge}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                onNodeAction={handleNodeAction}
                fitView
                connectionLineStyle={connectionLineStyle}
                style={{
                  background: isDark
                    ? `linear-gradient(135deg, #0f0f0f 0%, #1a1a1a 50%, #0f0f0f 100%)`
                    : `linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f1f5f9 100%)`,
                  borderRadius: "24px",
                }}
                edgeTypes={edgeTypes}
                defaultEdgeOptions={{
                  style: {
                    stroke: isDark ? "#3b82f6" : "#1e40af",
                    strokeWidth: "3px",
                    filter: "drop-shadow(0 0 6px rgba(59, 130, 246, 0.6))",
                  },
                  animated: true,
                  type: "buttonedge",
                }}
              >
                {/* MiniMap modernizado */}
                <MiniMap
                  nodeStrokeColor={(n) => {
                    if (n.selected) return "#3b82f6";
                    return isDark ? "#4a5568" : "#cbd5e0";
                  }}
                  nodeColor={(n) => {
                    const colors = {
                      start: "#667eea",
                      message: "#f5576c",
                      menu: "#4facfe",
                      interval: "#fa709a",
                      randomizer: "#43e97b",
                      httpRequest: "#667eea",
                      ticket: "#a8edea",
                      typebot: "#667eea",
                      openai: "#fcb69f",
                      question: "#a18cd1",
                    };
                    return colors[n.type] || (isDark ? "#4a5568" : "#e2e8f0");
                  }}
                  nodeBorderRadius={12}
                  style={{
                    ...modernStyles.glassmorphism,
                    borderRadius: "16px",
                    right: 24,
                    bottom: 24,
                    overflow: "hidden",
                  }}
                />

                {/* Controles modernizados */}
                <Controls
                  style={{
                    ...modernStyles.glassmorphism,
                    borderRadius: "16px",
                    left: 24,
                    bottom: 24,
                    overflow: "hidden",
                  }}
                />

                {/* Background com padrão moderno */}
                <Background
                  variant={showGrid ? "dots" : "none"}
                  gap={20}
                  size={2}
                  color={isDark ? "#374151" : "#cbd5e0"}
                  style={{
                    opacity: 0.5,
                  }}
                />
              </ReactFlow>
            </Box>
          </Card>
        </Fade>
      )}

      {/* Estilos CSS globais modernos */}
      <style jsx global>{`
        .react-flow__node {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 16px !important;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .react-flow__node:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
        }

        .react-flow__node.selected,
        .react-flow__node:focus {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.5),
            0 0 20px rgba(59, 130, 246, 0.3);
          border: 2px solid #3b82f6;
        }

        .react-flow__edge {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .react-flow__edge.selected .react-flow__edge-path,
        .react-flow__edge:focus .react-flow__edge-path {
          stroke: #3b82f6 !important;
          stroke-width: 4px !important;
          filter: drop-shadow(0 0 10px rgba(59, 130, 246, 0.8));
        }

        .react-flow__edge:hover .react-flow__edge-path {
          stroke: #60a5fa !important;
          stroke-width: 4px !important;
          filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.6));
        }

        .react-flow__handle {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          width: 12px;
          height: 12px;
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .react-flow__handle:hover {
          transform: scale(1.3);
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }

        .react-flow__attribution {
          display: none;
        }

        .react-flow__minimap {
          border-radius: 16px;
          overflow: hidden;
          backdropfilter: blur(20px);
        }

        .react-flow__controls {
          border-radius: 16px;
          overflow: hidden;
          backdropfilter: blur(20px);
        }

        .react-flow__controls button {
          border-radius: 12px;
          margin: 4px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          color: ${isDark ? "#ffffff" : "#4a5568"};
          border: none;
        }

        .react-flow__controls button:hover {
          transform: scale(1.1);
          background: ${isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(102, 126, 234, 0.1)"};
          color: #667eea;
        }

        .react-flow__controls button svg {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Animações de entrada para nós */
        @keyframes nodeAppear {
          0% {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .react-flow__node-default,
        .react-flow__node-input,
        .react-flow__node-output {
          animation: nodeAppear 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        span.MuiSpeedDialIcon-root.css-27nu2n-MuiSpeedDialIcon-root {
          display: flex;
        }
        /* Efeitos de hover nos botões */
        .MuiButton-root {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        .MuiSpeedDial-fab {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Scrollbar customizada */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${isDark
            ? "rgba(255, 255, 255, 0.1)"
            : "rgba(0, 0, 0, 0.1)"};
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
      `}</style>
    </Box>
  );
};

export default FlowBuilderConfig;
