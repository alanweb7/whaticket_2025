import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1
    },

    extraAttr: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },

    btnWrapper: {
        position: "relative"
    },

    buttonProgress: {
        color: green[500],
        position: "absolute",
        top: "50%",
        left: "50%",
        marginTop: -12,
        marginLeft: -12
    }
}));

const FlowBuilderTicketModal = ({
    open,
    onSave,
    data,
    onUpdate,
    close
}) => {
    const classes = useStyles();
    const isMounted = useRef(true);
    const [activeModal, setActiveModal] = useState(false)
    const [queues, setQueues] = useState([])
    const [selectedQueue, setQueueSelected] = useState()

    // novos useStates
    const [agents, setAgents] = useState([]);          // lista de atendentes
    const [selectedAgent, setSelectedAgent] = useState(""); // id do atendente selecionado



    useEffect(() => {
        const loadData = async () => {
            try {
                // Carrega filas e usuários em paralelo
                const [queuesRes, usersRes] = await Promise.all([
                    api.get("/queue"),
                    api.get("/users")
                ]);

                const queuesData = queuesRes.data || [];
                const usersData = usersRes.data?.users || usersRes.data || [];

                console.log("✅ Filas carregadas:", queuesData);
                console.log("✅ Usuários carregados:", usersData);

                // Define no state ANTES de continuar
                setQueues(queuesData);
                setAgents(usersData);

                // Aguarda o React aplicar o estado antes de prosseguir
                await new Promise(resolve => setTimeout(resolve, 0));

                if (open === "edit") {
                    console.log("✏️ Editando... Dados recebidos:", data);

                    // 🟦 Localiza a fila correta
                    const queue = queuesData.find(
                        item => item.id === data?.queue?.id || item.id === data?.data?.id
                    );

                    if (queue) {
                        console.log("🟢 Fila encontrada:", queue.name);
                        setQueueSelected(queue.id);
                    } else {
                        console.warn("⚠️ Nenhuma fila encontrada com esse ID:", data?.queue?.id);
                    }

                    // 🟩 Localiza o atendente salvo
                    const savedAgentId = data?.user?.id || null;
                    if (savedAgentId) {
                        const agentExists = usersData.some(a => a.id === savedAgentId);
                        if (agentExists) {
                            console.log("👤 Atendente encontrado:", savedAgentId);
                            setSelectedAgent(savedAgentId);
                        } else {
                            console.warn("⚠️ Atendente não encontrado na lista:", savedAgentId);
                        }
                    }
                }


                // Ativa o modal apenas quando tudo estiver pronto
                setActiveModal(true);

            } catch (error) {
                console.error("❌ Erro ao carregar filas/usuários:", error);
            }
        };

        if (open === "edit" || open === "create") {
            loadData();
        }

        return () => {
            isMounted.current = false;
        };
    }, [open]);




    const handleClose = () => {
        close(null)
        setActiveModal(false)
    };


    const handleSaveContact = () => {
        if (!selectedQueue) {
            return toast.error("Adicione uma fila");
        }

        // Obtém a fila e o agente selecionados
        const queue = queues.find(item => item.id === selectedQueue);
        const agent = agents.find(a => a.id === selectedAgent);

        if (!queue) {
            return toast.error("Fila inválida");
        }

        // Monta o payload final
        const payload = {
            queue: queue,
            user: agent || null, // 👈 aqui vai o user (atendente)
        };

        console.log("💾 Salvando dados:", payload);

        if (open === "edit") {
            onUpdate({
                ...data,
                ...payload
            });
        } else if (open === "create") {
            onSave(payload);
        }

        handleClose();
    };


    return (
        <div className={classes.root}>
            <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
                <DialogTitle id="form-dialog-title">
                    {open === 'create' ? `Adicionar um setor ao fluxo` : `Editar Setor`}
                </DialogTitle>
                <Stack>
                    <DialogContent dividers>
                        {/* Select da Fila */}
                        <InputLabel id="queue-label">Fila *</InputLabel>
                        <Select
                            labelId="queue-label"
                            id="queue-select"
                            value={selectedQueue || ""}
                            style={{ width: "95%", marginBottom: 20 }}
                            onChange={(e) => {
                                setQueueSelected(e.target.value);
                                setSelectedAgent(""); // limpa o atendente ao trocar de fila
                            }}
                            renderValue={() => {
                                if (!selectedQueue) return "Selecione uma Fila";
                                const queue = queues.find(w => w.id === selectedQueue);
                                return queue ? queue.name : "";
                            }}
                        >
                            {queues.map((queue) => (
                                <MenuItem key={queue.id} value={queue.id}>
                                    {queue.name}
                                </MenuItem>
                            ))}
                        </Select>

                        {/* Select do Atendente */}
                        <InputLabel id="agent-label">Atendente (opcional)</InputLabel>
                        <Select
                            labelId="agent-label"
                            id="agent-select"
                            value={selectedAgent || ""}
                            style={{ width: "95%" }}
                            disabled={!selectedQueue}
                            onChange={(e) => setSelectedAgent(e.target.value)}
                            renderValue={() => {
                                if (!selectedAgent) return "Selecione um Atendente (opcional)";
                                const agent = agents.find(a => a.id === selectedAgent);
                                return agent ? agent.name : "";
                            }}
                        >
                            {agents
                                // 🔍 Filtro correto: verifica se o agente está vinculado à fila
                                .filter(a => a.queues?.some(q => q.id === selectedQueue))
                                .map(agent => (
                                    <MenuItem key={agent.id} value={agent.id}>
                                        {agent.name}
                                        <span
                                            style={{
                                                fontSize: 12,
                                                color: agent.online ? "green" : "gray",
                                                marginLeft: 8,
                                            }}
                                        >
                                            {agent.online ? "🟢 online" : "🔴 offline"}
                                        </span>
                                    </MenuItem>
                                ))}
                        </Select>

                    </DialogContent>

                    <DialogActions>
                        <Button
                            onClick={handleClose}
                            color="secondary"
                            variant="outlined"
                        >
                            {i18n.t("contactModal.buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            className={classes.btnWrapper}
                            onClick={handleSaveContact}
                        >
                            {open === 'create' ? `Adicionar` : 'Editar'}
                        </Button>
                    </DialogActions>
                </Stack>
            </Dialog>
        </div>
    );
};

export default FlowBuilderTicketModal;