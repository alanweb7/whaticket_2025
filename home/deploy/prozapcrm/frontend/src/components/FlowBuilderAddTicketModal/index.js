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

                // Atualiza estados
                setQueues(queuesData);
                setAgents(usersData);

                // Seleção inicial no modo edição
                if (open === "edit" && data) {
                    console.log("✏️ Editando... Dados recebidos:", data);

                    // encontra a fila, cobrindo ambos os formatos possíveis em `data`
                    const queue = queuesData.find(
                        item =>
                            item.id === Number(data?.queue?.id) ||
                            item.id === Number(data?.data?.id) ||
                            item.id === Number(data?.id)
                    );

                    if (queue) {
                        console.log("🟢 Fila encontrada:", queue.name);
                        setQueueSelected(queue.id); // guardamos o ID (number)
                    } else {
                        console.warn("⚠️ Nenhuma fila encontrada com esse ID:", data);
                    }

                    // 🟩 Atendente salvo (cobre data.user e data.data.user)
                    const savedAgentId =
                        Number(data?.user?.id) ||
                        Number(data?.data?.user?.id) ||
                        Number(data?.agent?.id) ||
                        null;

                    if (savedAgentId) {
                        // verifica usando usersData (que já veio da API)
                        const agentExists = usersData.some(a => Number(a.id) === savedAgentId);
                        if (agentExists) {
                            console.log("👤 Atendente encontrado nos dados da API:", savedAgentId);
                            setSelectedAgent(savedAgentId);
                        } else {
                            console.warn("⚠️ Atendente não encontrado na lista retornada:", savedAgentId);
                        }
                    }
                }

                // Ativa modal
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
    }, [open, data]);




    const handleClose = () => {
        close(null)
        setActiveModal(false)
    };


    // Salvamento com hierarquia correta: data: { ...queueWithUser }
    const handleSaveContact = () => {
        if (!selectedQueue) {
            return toast.error('Adicione uma fila');
        }

        // garantir tipos
        const queueIdNum = Number(selectedQueue);
        const userIdNum = selectedAgent ? Number(selectedAgent) : null;

        const queue = queues.find(item => Number(item.id) === queueIdNum);
        const user = agents.find(a => Number(a.id) === userIdNum);

        if (!queue) {
            return toast.error('Fila inválida');
        }

        // Cria um novo objeto incluindo o user (mantendo o formato que vinha no JSON original)
        const queueWithUser = {
            ...queue,
            user: user || null
        };

        if (open === 'edit') {
            onUpdate({
                ...data,
                data: { ...queueWithUser } // sem criar outro nível de data
            });
        } else if (open === 'create') {
            onSave({ ...queueWithUser }); // sem encapsular em "data"
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
                            value={selectedQueue ?? ""} // guardamos number ou undefined
                            style={{ width: "95%", marginBottom: 20 }}
                            onChange={(e) => {
                                // garantir number
                                const val = Number(e.target.value);
                                setQueueSelected(val);
                                setSelectedAgent(""); // limpa o atendente ao trocar de fila
                            }}
                            renderValue={() => {
                                if (selectedQueue === undefined || selectedQueue === "") return "Selecione uma Fila";
                                const queue = queues.find(w => Number(w.id) === Number(selectedQueue));
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
                            value={selectedAgent ?? ""}
                            style={{ width: "95%" }}
                            disabled={!selectedQueue}
                            onChange={(e) => {
                                const val = e.target.value === "" ? "" : Number(e.target.value);
                                setSelectedAgent(val);
                            }}
                            renderValue={() => {
                                if (!selectedAgent) return "Selecione um Atendente (opcional)";
                                const agent = agents.find(a => Number(a.id) === Number(selectedAgent));
                                return agent ? agent.name : "";
                            }}
                        >
                            {agents
                                .filter(a => a.queues?.some(q => Number(q.id) === Number(selectedQueue)))
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
