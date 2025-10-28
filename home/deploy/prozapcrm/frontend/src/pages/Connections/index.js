import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { add, format, parseISO } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Box,
  Card,
  CardContent,
  Grid,
  Container,
  Avatar,
  Chip,
  LinearProgress,
  Fade,
  Grow,
  Divider,
} from "@material-ui/core";
import {
  Edit,
  CheckCircle,
  SignalCellularConnectedNoInternet2Bar,
  SignalCellularConnectedNoInternet0Bar,
  SignalCellular4Bar,
  CropFree,
  DeleteOutline,
  Facebook,
  Instagram,
  WhatsApp,
  Add,
  Refresh,
  HelpOutline,
  Star,
  FiberManualRecord,
  AccessTime,
  Warning,
  CheckCircleOutline,
  ErrorOutline,
  Info,
  CloudDownload,
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import WhatsAppModal from "../../components/WhatsAppModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import QrcodeModal from "../../components/QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";
import formatSerializedId from "../../utils/formatSerializedId";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import ForbiddenPage from "../../components/ForbiddenPage";
import { Can } from "../../components/Can";
import moment from "moment";

const useStyles = makeStyles((theme) => ({
  root: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: "100vh",
    paddingBottom: theme.spacing(4),
  },
  headerSection: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: theme.spacing(4, 0),
    position: "relative",
    overflow: "hidden",
    marginBottom: theme.spacing(4),
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'url(\'data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.1"><circle cx="36" cy="24" r="2"/><circle cx="18" cy="48" r="1"/><circle cx="48" cy="12" r="1.5"/></g></svg>\')',
    },
  },
  headerContent: {
    position: "relative",
    zIndex: 1,
  },
  connectionCard: {
    borderRadius: "20px",
    border: "none",
    boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    background: "white",
    height: "100%",
    "&:hover": {
      transform: "translateY(-8px)",
      boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
    },
  },
  connectionCardContent: {
    padding: theme.spacing(3),
    height: "100%",
    display: "flex",
    flexDirection: "column",
    "&:last-child": {
      paddingBottom: theme.spacing(3),
    },
  },
  channelAvatar: {
    width: 64,
    height: 64,
    marginBottom: theme.spacing(2),
    boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
    border: "4px solid white",
  },
  connectionName: {
    fontWeight: 800,
    fontSize: "1.2rem",
    color: "#2d3748",
    marginBottom: theme.spacing(1),
    lineHeight: 1.2,
  },
  connectionNumber: {
    color: "#718096",
    fontSize: "0.9rem",
    fontWeight: 500,
    marginBottom: theme.spacing(2),
  },
  statusChip: {
    fontWeight: 700,
    fontSize: "0.75rem",
    borderRadius: "12px",
    height: "32px",
    marginBottom: theme.spacing(2),
  },
  actionButton: {
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    padding: "10px 20px",
    boxShadow: "none",
    fontSize: "0.85rem",
    margin: "4px",
    "&:hover": {
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    },
  },
  importCard: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "20px",
    marginBottom: theme.spacing(3),
    overflow: "hidden",
    position: "relative",
  },
  importCardContent: {
    padding: theme.spacing(3),
    position: "relative",
    zIndex: 1,
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  addConnectionCard: {
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)",
    border: "3px dashed #667eea",
    borderRadius: "20px",
    minHeight: "280px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background:
        "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
      transform: "translateY(-4px)",
      borderColor: "#5a6fd8",
    },
  },
  defaultBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    color: "#744210",
    zIndex: 2,
    fontWeight: 700,
    fontSize: "0.7rem",
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    left: 16,
    zIndex: 2,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.9)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "20px",
    zIndex: 10,
  },
  headerButtons: {
    display: "flex",
    gap: theme.spacing(2),
    flexWrap: "wrap",
  },
  modernButton: {
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 600,
    padding: "12px 24px",
    fontSize: "0.9rem",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(8),
    color: "#718096",
  },
  statsCard: {
    background: "rgba(255,255,255,0.9)",
    backdropFilter: "blur(10px)",
    borderRadius: "16px",
    padding: theme.spacing(2),
    border: "1px solid rgba(255,255,255,0.2)",
  },
  // Nova classe para animação de entrada
  newConnectionAnimation: {
    animation: "slideInFromTop 0.6s ease-out",
  },
  // Nova classe para animação de atualização de status
  statusUpdateAnimation: {
    animation: "pulse 0.8s ease-in-out",
  },
}));

function CircularProgressWithLabel(props) {
  return (
    <Box position="relative" display="inline-flex">
      <CircularProgress
        variant="determinate"
        {...props}
        size={80}
        thickness={4}
        style={{ color: "white" }}
      />
      <Box
        top={0}
        left={0}
        bottom={0}
        right={0}
        position="absolute"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Typography
          variant="h6"
          component="div"
          style={{ color: "white", fontWeight: "bold" }}
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

const ConnectionStatusIndicator = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "CONNECTED":
        return {
          color: "#10b981",
          bgColor: "#10b98120",
          icon: <CheckCircleOutline style={{ fontSize: 16 }} />,
          label: "Conectado",
          pulse: false,
        };
      case "DISCONNECTED":
        return {
          color: "#ef4444",
          bgColor: "#ef444420",
          icon: <ErrorOutline style={{ fontSize: 16 }} />,
          label: "Desconectado",
          pulse: false,
        };
      case "qrcode":
        return {
          color: "#f59e0b",
          bgColor: "#f59e0b20",
          icon: <CropFree style={{ fontSize: 16 }} />,
          label: "QR Code",
          pulse: true,
        };
      case "OPENING":
        return {
          color: "#3b82f6",
          bgColor: "#3b82f620",
          icon: <CircularProgress size={16} style={{ color: "#3b82f6" }} />,
          label: "Conectando",
          pulse: true,
        };
      case "TIMEOUT":
      case "PAIRING":
        return {
          color: "#f97316",
          bgColor: "#f9731620",
          icon: <Warning style={{ fontSize: 16 }} />,
          label: "Timeout",
          pulse: false,
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#6b728020",
          icon: <Info style={{ fontSize: 16 }} />,
          label: "Desconhecido",
          pulse: false,
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Chip
      icon={config.icon}
      label={config.label}
      size="small"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 700,
        fontSize: "0.75rem",
        borderRadius: "12px",
        height: "32px",
        animation: config.pulse ? "pulse 2s infinite" : "none",
      }}
    />
  );
};

const ChannelIcon = ({ channel, size = 64 }) => {
  const getChannelConfig = (channel) => {
    switch (channel) {
      case "whatsapp":
        return {
          icon: <WhatsApp style={{ fontSize: size * 0.6 }} />,
          color: "#25d366",
          background: "linear-gradient(135deg, #25d366 0%, #128c7e 100%)",
        };
      case "facebook":
        return {
          icon: <Facebook style={{ fontSize: size * 0.6 }} />,
          color: "#1877f2",
          background: "linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)",
        };
      case "instagram":
        return {
          icon: <Instagram style={{ fontSize: size * 0.6 }} />,
          color: "#e4405f",
          background: "linear-gradient(135deg, #e4405f 0%, #f77737 100%)",
        };
      default:
        return {
          icon: <WhatsApp style={{ fontSize: size * 0.6 }} />,
          color: "#6b7280",
          background: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
        };
    }
  };

  const config = getChannelConfig(channel);

  return (
    <Avatar
      style={{
        width: size,
        height: size,
        background: config.background,
        color: "white",
        boxShadow: `0 8px 24px ${config.color}30`,
        border: "4px solid white",
        marginTop: "30px",
      }}
    >
      {config.icon}
    </Avatar>
  );
};

const ConnectionCard = ({
  whatsApp,
  onEdit,
  onDelete,
  onQrCode,
  onDisconnect,
  onStartSession,
  onRequestQr,
  onCloseImported,
  user,
  classes,
  renderImportButton,
  isNew = false,
  hasStatusUpdate = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async (action) => {
    setIsLoading(true);
    try {
      await action();
    } finally {
      setIsLoading(false);
    }
  };

  const renderActionButtons = () => {
    const buttons = [];

    switch (whatsApp.status) {
      case "qrcode":
        buttons.push(
          <Button
            key="qr"
            variant="contained"
            size="small"
            onClick={() => handleAction(() => onQrCode(whatsApp))}
            className={classes.actionButton}
            style={{
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
            }}
          >
            Ver QR Code
          </Button>
        );
        break;
      case "DISCONNECTED":
        buttons.push(
          <Button
            key="retry"
            variant="outlined"
            size="small"
            onClick={() => handleAction(() => onStartSession(whatsApp.id))}
            className={classes.actionButton}
            style={{
              borderColor: "#3b82f6",
              color: "#3b82f6",
            }}
          >
            Tentar Novamente
          </Button>
        );
        buttons.push(
          <Button
            key="newqr"
            variant="outlined"
            size="small"
            onClick={() => handleAction(() => onRequestQr(whatsApp.id))}
            className={classes.actionButton}
            style={{
              borderColor: "#6b7280",
              color: "#6b7280",
            }}
          >
            Novo QR
          </Button>
        );
        break;
      case "CONNECTED":
      case "PAIRING":
      case "TIMEOUT":
        buttons.push(
          <Button
            key="disconnect"
            variant="outlined"
            size="small"
            onClick={() => handleAction(() => onDisconnect(whatsApp.id))}
            className={classes.actionButton}
            style={{
              borderColor: "#ef4444",
              color: "#ef4444",
            }}
          >
            Desconectar
          </Button>
        );

        const importBtn = renderImportButton(whatsApp);
        if (importBtn) {
          buttons.push(
            React.cloneElement(importBtn, {
              key: "import",
              className: classes.actionButton,
            })
          );
        }
        break;
      case "OPENING":
        buttons.push(
          <Button
            key="opening"
            variant="outlined"
            size="small"
            disabled
            className={classes.actionButton}
            style={{
              borderColor: "#d1d5db",
              color: "#9ca3af",
            }}
          >
            Conectando...
          </Button>
        );
        break;
    }

    return (
      <Box style={{ display: "flex", flexWrap: "wrap", marginBottom: 16 }}>
        {buttons}
      </Box>
    );
  };

  const cardClasses = `${classes.connectionCard} ${
    isNew ? classes.newConnectionAnimation : ""
  } ${hasStatusUpdate ? classes.statusUpdateAnimation : ""}`;

  return (
    <Grow in={true} timeout={500}>
      <Card className={cardClasses}>
        {isLoading && (
          <Box className={classes.loadingOverlay}>
            <CircularProgress size={32} />
          </Box>
        )}

        {whatsApp.isDefault && (
          <Chip
            icon={<Star style={{ fontSize: 14 }} />}
            label="Padrão"
            size="small"
            className={classes.defaultBadge}
          />
        )}

        <Box className={classes.statusIndicator}>
          <ConnectionStatusIndicator status={whatsApp.status} />
        </Box>

        <CardContent className={classes.connectionCardContent}>
          <Box
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
            <Box
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <ChannelIcon channel={whatsApp.channel} />
            </Box>

            <Typography className={classes.connectionName} noWrap>
              {whatsApp.name}
            </Typography>

            {whatsApp.number && (
              <Typography className={classes.connectionNumber}>
                {whatsApp.channel === "whatsapp"
                  ? formatSerializedId(whatsApp.number)
                  : whatsApp.number}
              </Typography>
            )}

            <Box
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <AccessTime style={{ fontSize: 16, color: "#9ca3af" }} />
              <Typography
                variant="body2"
                style={{ color: "#9ca3af", fontSize: "0.8rem" }}
              >
                {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
              </Typography>
            </Box>

            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform="connections-page:addConnection"
              yes={() => (
                <Box style={{ marginTop: "auto" }}>
                  {renderActionButtons()}

                  <Box
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <IconButton
                      size="small"
                      onClick={() => onEdit(whatsApp)}
                      style={{
                        color: "#6b7280",
                        background: "#f3f4f6",
                        width: 36,
                        height: 36,
                      }}
                    >
                      <Edit style={{ fontSize: 18 }} />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => onDelete(whatsApp.id)}
                      style={{
                        color: "#ef4444",
                        background: "#fef2f2",
                        width: 36,
                        height: 36,
                      }}
                    >
                      <DeleteOutline style={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Box>
              )}
            />
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );
};

const Connections = () => {
  const classes = useStyles();

  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [statusImport, setStatusImport] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const { handleLogout } = useContext(AuthContext);
  const history = useHistory();

  // Estados para controlar animações
  const [newConnections, setNewConnections] = useState(new Set());
  const [statusUpdates, setStatusUpdates] = useState(new Set());

  const confirmationModalInitialState = {
    action: "",
    title: "",
    message: "",
    whatsAppId: "",
    open: false,
  };
  const [confirmModalInfo, setConfirmModalInfo] = useState(
    confirmationModalInitialState
  );
  const [planConfig, setPlanConfig] = useState(false);

  const { user, socket } = useContext(AuthContext);

  const companyId = user.companyId;

  const { getPlanCompany } = usePlans();

  useEffect(() => {
    async function fetchData() {
      const planConfigs = await getPlanCompany(undefined, companyId);
      setPlanConfig(planConfigs);
    }
    fetchData();
  }, []);

  var before = moment(moment().format()).isBefore(user.company.dueDate);

  if (before !== true) {
    handleLogout();
  }

  // Socket listeners para atualizações em tempo real
  useEffect(() => {
    if (socket) {
      // Listener para importação de mensagens
      socket.on(`importMessages-${user.companyId}`, (data) => {
        if (data.action === "refresh") {
          setStatusImport([]);
          history.go(0);
        }
        if (data.action === "update") {
          setStatusImport(data.status);
        }
      });

      // Listener para atualizações de WhatsApp
      socket.on(`whatsapp-${user.companyId}`, (data) => {
        console.log("Socket WhatsApp event:", data);

        if (data.action === "create") {
          // Nova conexão criada
          console.log("Nova conexão criada:", data.whatsapp);
          setNewConnections((prev) => new Set([...prev, data.whatsapp.id]));

          // Remover animação após 2 segundos
          setTimeout(() => {
            setNewConnections((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.whatsapp.id);
              return newSet;
            });
          }, 2000);
        }

        if (data.action === "update") {
          // Status da conexão atualizado
          console.log("Status atualizado:", data.whatsapp);
          setStatusUpdates((prev) => new Set([...prev, data.whatsapp.id]));

          // Remover animação após 1 segundo
          setTimeout(() => {
            setStatusUpdates((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.whatsapp.id);
              return newSet;
            });
          }, 1000);
        }
      });

      // Listener para mudanças de status de sessão
      socket.on(`whatsappSession-${user.companyId}`, (data) => {
        console.log("Socket WhatsApp Session event:", data);

        if (data.action === "update") {
          setStatusUpdates((prev) => new Set([...prev, data.session.id]));

          setTimeout(() => {
            setStatusUpdates((prev) => {
              const newSet = new Set(prev);
              newSet.delete(data.session.id);
              return newSet;
            });
          }, 1000);
        }
      });

      // Cleanup
      return () => {
        socket.off(`importMessages-${user.companyId}`);
        socket.off(`whatsapp-${user.companyId}`);
        socket.off(`whatsappSession-${user.companyId}`);
      };
    }
  }, [socket, user.companyId, history]);

  const responseFacebook = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const responseInstagram = (response) => {
    if (response.status !== "unknown") {
      const { accessToken, id } = response;

      api
        .post("/facebook", {
          addInstagram: true,
          facebookUserId: id,
          facebookUserToken: accessToken,
        })
        .then((response) => {
          toast.success(i18n.t("connections.facebook.success"));
        })
        .catch((error) => {
          toastError(error);
        });
    }
  };

  const handleStartWhatsAppSession = async (whatsAppId) => {
    try {
      await api.post(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleRequestNewQrCode = async (whatsAppId) => {
    try {
      await api.put(`/whatsappsession/${whatsAppId}`);
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenWhatsAppModal = () => {
    setSelectedWhatsApp(null);
    setWhatsAppModalOpen(true);
  };

  const handleCloseWhatsAppModal = useCallback(() => {
    setWhatsAppModalOpen(false);
    setSelectedWhatsApp(null);
  }, [setSelectedWhatsApp, setWhatsAppModalOpen]);

  const handleOpenQrModal = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setQrModalOpen(true);
  };

  const handleCloseQrModal = useCallback(() => {
    setSelectedWhatsApp(null);
    setQrModalOpen(false);
  }, [setQrModalOpen, setSelectedWhatsApp]);

  const handleEditWhatsApp = (whatsApp) => {
    setSelectedWhatsApp(whatsApp);
    setWhatsAppModalOpen(true);
  };

  const openInNewTab = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleOpenConfirmationModal = (action, whatsAppId) => {
    if (action === "disconnect") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.disconnectTitle"),
        message: i18n.t("connections.confirmationModal.disconnectMessage"),
        whatsAppId: whatsAppId,
      });
    }

    if (action === "delete") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.deleteTitle"),
        message: i18n.t("connections.confirmationModal.deleteMessage"),
        whatsAppId: whatsAppId,
      });
    }
    if (action === "closedImported") {
      setConfirmModalInfo({
        action: action,
        title: i18n.t("connections.confirmationModal.closedImportedTitle"),
        message: i18n.t("connections.confirmationModal.closedImportedMessage"),
        whatsAppId: whatsAppId,
      });
    }
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(`/whatsappsession/${confirmModalInfo.whatsAppId}`);
      } catch (err) {
        toastError(err);
      }
    }

    if (confirmModalInfo.action === "delete") {
      try {
        await api.delete(`/whatsapp/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.deleted"));
      } catch (err) {
        toastError(err);
      }
    }
    if (confirmModalInfo.action === "closedImported") {
      try {
        await api.post(`/closedimported/${confirmModalInfo.whatsAppId}`);
        toast.success(i18n.t("connections.toasts.closedimported"));
      } catch (err) {
        toastError(err);
      }
    }

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const renderImportButton = (whatsApp) => {
    if (whatsApp?.statusImportMessages === "renderButtonCloseTickets") {
      return (
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            handleOpenConfirmationModal("closedImported", whatsApp.id);
          }}
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "white",
          }}
        >
          {i18n.t("connections.buttons.closedImported")}
        </Button>
      );
    }

    if (whatsApp?.importOldMessages) {
      let isTimeStamp = !isNaN(
        new Date(Math.floor(whatsApp?.statusImportMessages)).getTime()
      );

      if (isTimeStamp) {
        const ultimoStatus = new Date(
          Math.floor(whatsApp?.statusImportMessages)
        ).getTime();
        const dataLimite = +add(ultimoStatus, { seconds: +35 }).getTime();
        if (dataLimite > new Date().getTime()) {
          return (
            <Button
              disabled
              size="small"
              variant="outlined"
              endIcon={<CircularProgress size={12} />}
            >
              {i18n.t("connections.buttons.preparing")}
            </Button>
          );
        }
      }
    }
    return null;
  };

  const restartWhatsapps = async () => {
    try {
      await api.post(`/whatsapp-restart/`);
      toast.success(i18n.t("connections.waitConnection"));
    } catch (err) {
      toastError(err);
    }
  };

  const getConnectionStats = () => {
    const connected = whatsApps.filter((w) => w.status === "CONNECTED").length;
    const disconnected = whatsApps.filter(
      (w) => w.status === "DISCONNECTED"
    ).length;
    const total = whatsApps.length;

    return { connected, disconnected, total };
  };

  const stats = getConnectionStats();

  if (user.profile === "user" && user.allowConnections === "disabled") {
    return <ForbiddenPage />;
  }

  return (
    <Box className={classes.root}>
      <ConfirmationModal
        title={confirmModalInfo.title}
        open={confirmModalOpen}
        onClose={setConfirmModalOpen}
        onConfirm={handleSubmitConfirmationModal}
      >
        {confirmModalInfo.message}
      </ConfirmationModal>

      {qrModalOpen && (
        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />
      )}

      <WhatsAppModal
        open={whatsAppModalOpen}
        onClose={handleCloseWhatsAppModal}
        whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
      />

      <Box className={classes.headerSection}>
        <Container maxWidth="lg" className={classes.headerContent}>
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography
                variant="h3"
                style={{ fontWeight: 800, marginBottom: 8 }}
              >
                {i18n.t("connections.title")}
              </Typography>
              <Typography
                variant="h6"
                style={{ opacity: 0.9, fontWeight: 400, marginBottom: 24 }}
              >
                Gerencie todas as suas conexões de comunicação
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Box className={classes.statsCard}>
                    <Typography
                      variant="h4"
                      style={{ fontWeight: 700, color: "#10b981" }}
                    >
                      {stats.connected}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#6b7280" }}>
                      Conectadas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box className={classes.statsCard}>
                    <Typography
                      variant="h4"
                      style={{ fontWeight: 700, color: "#ef4444" }}
                    >
                      {stats.disconnected}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#6b7280" }}>
                      Desconectadas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box className={classes.statsCard}>
                    <Typography
                      variant="h4"
                      style={{ fontWeight: 700, color: "#667eea" }}
                    >
                      {stats.total}
                    </Typography>
                    <Typography variant="body2" style={{ color: "#6b7280" }}>
                      Total
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Grid>

            <Grid item xs={12} md={4}>
              <Box className={classes.headerButtons}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={restartWhatsapps}
                  className={classes.modernButton}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  {i18n.t("connections.restartConnections")}
                </Button>

                <Button
                  variant="contained"
                  startIcon={<HelpOutline />}
                  onClick={() =>
                    openInNewTab(
                      `https://wa.me/${process.env.REACT_APP_NUMBER_SUPPORT}`
                    )
                  }
                  className={classes.modernButton}
                  style={{
                    background: "rgba(255,255,255,0.2)",
                    backdropFilter: "blur(10px)",
                    border: "1px solid rgba(255,255,255,0.3)",
                    color: "white",
                  }}
                >
                  {i18n.t("connections.callSupport")}
                </Button>

                <Can
                  role={user.profile}
                  perform="connections-page:addConnection"
                  yes={() => (
                    <PopupState variant="popover" popupId="add-connection-menu">
                      {(popupState) => (
                        <>
                          <Button
                            variant="contained"
                            startIcon={<Add />}
                            {...bindTrigger(popupState)}
                            className={classes.modernButton}
                            style={{
                              background: "rgba(255,255,255,0.95)",
                              color: "#667eea",
                              fontWeight: 700,
                            }}
                          >
                            {i18n.t("connections.newConnection")}
                          </Button>

                          <Menu {...bindMenu(popupState)}>
                            <MenuItem
                              disabled={!planConfig?.plan?.useWhatsapp}
                              onClick={() => {
                                handleOpenWhatsAppModal();
                                popupState.close();
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 16,
                                padding: "12px 20px",
                              }}
                            >
                              <ChannelIcon channel="whatsapp" size={32} />
                              <Box>
                                <Typography fontWeight={600}>
                                  WhatsApp
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="textSecondary"
                                >
                                  Conectar via QR Code
                                </Typography>
                              </Box>
                            </MenuItem>

                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="9.0"
                              scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                              callback={responseFacebook}
                              render={(renderProps) => (
                                <MenuItem
                                  disabled={!planConfig?.plan?.useFacebook}
                                  onClick={renderProps.onClick}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "12px 20px",
                                  }}
                                >
                                  <ChannelIcon channel="facebook" size={32} />
                                  <Box>
                                    <Typography fontWeight={600}>
                                      Facebook
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Conectar páginas do Facebook
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              )}
                            />

                            <FacebookLogin
                              appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                              autoLoad={false}
                              fields="name,email,picture"
                              version="9.0"
                              scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                              callback={responseInstagram}
                              render={(renderProps) => (
                                <MenuItem
                                  disabled={!planConfig?.plan?.useInstagram}
                                  onClick={renderProps.onClick}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 16,
                                    padding: "12px 20px",
                                  }}
                                >
                                  <ChannelIcon channel="instagram" size={32} />
                                  <Box>
                                    <Typography fontWeight={600}>
                                      Instagram
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="textSecondary"
                                    >
                                      Conectar perfis do Instagram
                                    </Typography>
                                  </Box>
                                </MenuItem>
                              )}
                            />
                          </Menu>
                        </>
                      )}
                    </PopupState>
                  )}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {statusImport?.all && (
          <Fade in={true}>
            <Card className={classes.importCard}>
              <CardContent className={classes.importCardContent}>
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 16,
                  }}
                >
                  <Box
                    style={{ display: "flex", alignItems: "center", gap: 16 }}
                  >
                    <CloudDownload style={{ fontSize: 32 }} />
                    <Box>
                      <Typography
                        variant="h5"
                        style={{ fontWeight: 700, marginBottom: 4 }}
                      >
                        {statusImport?.this === -1
                          ? i18n.t("connections.buttons.preparing")
                          : i18n.t("connections.buttons.importing")}
                      </Typography>
                      <Typography variant="body2" style={{ opacity: 0.9 }}>
                        Processando mensagens antigas
                      </Typography>
                    </Box>
                  </Box>

                  {statusImport?.this !== -1 && (
                    <CircularProgressWithLabel
                      value={(statusImport?.this / statusImport?.all) * 100}
                    />
                  )}
                </Box>

                {statusImport?.this === -1 ? (
                  <Box
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: 16,
                    }}
                  >
                    <CircularProgress size={32} style={{ color: "white" }} />
                  </Box>
                ) : (
                  <Box className={classes.progressContainer}>
                    <Typography
                      variant="body2"
                      style={{ marginBottom: 8, opacity: 0.9 }}
                    >
                      {`${i18n.t("connections.typography.processed")} ${
                        statusImport?.this
                      } ${i18n.t("connections.typography.in")} ${
                        statusImport?.all
                      } ${i18n.t("connections.typography.date")}: ${
                        statusImport?.date
                      }`}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(statusImport?.this / statusImport?.all) * 100}
                      style={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(255,255,255,0.3)",
                      }}
                    />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Fade>
        )}

        {loading ? (
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item}>
                <Card style={{ borderRadius: "20px", height: 280 }}>
                  <CardContent
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={40} />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : whatsApps?.length > 0 ? (
          <Grid container spacing={3}>
            {whatsApps.map((whatsApp, index) => (
              <Grid item xs={12} sm={6} md={4} key={whatsApp.id}>
                <ConnectionCard
                  whatsApp={whatsApp}
                  onEdit={handleEditWhatsApp}
                  onDelete={(id) => handleOpenConfirmationModal("delete", id)}
                  onQrCode={handleOpenQrModal}
                  onDisconnect={(id) =>
                    handleOpenConfirmationModal("disconnect", id)
                  }
                  onStartSession={handleStartWhatsAppSession}
                  onRequestQr={handleRequestNewQrCode}
                  onCloseImported={(id) =>
                    handleOpenConfirmationModal("closedImported", id)
                  }
                  user={user}
                  classes={classes}
                  renderImportButton={renderImportButton}
                  isNew={newConnections.has(whatsApp.id)}
                  hasStatusUpdate={statusUpdates.has(whatsApp.id)}
                />
              </Grid>
            ))}

            <Can
              role={user.profile}
              perform="connections-page:addConnection"
              yes={() => (
                <Grid item xs={12} sm={6} md={4}>
                  <PopupState variant="popover" popupId="add-from-grid">
                    {(popupState) => (
                      <>
                        <Card
                          className={classes.addConnectionCard}
                          {...bindTrigger(popupState)}
                        >
                          <Add
                            style={{
                              fontSize: 48,
                              color: "#667eea",
                              marginBottom: 16,
                            }}
                          />
                          <Typography
                            variant="h6"
                            style={{
                              fontWeight: 700,
                              color: "#667eea",
                              marginBottom: 8,
                            }}
                          >
                            Nova Conexão
                          </Typography>
                          <Typography
                            variant="body2"
                            style={{ color: "#9ca3af", textAlign: "center" }}
                          >
                            Adicione WhatsApp, Facebook ou Instagram
                          </Typography>
                        </Card>

                        <Menu {...bindMenu(popupState)}>
                          <MenuItem
                            disabled={!planConfig?.plan?.useWhatsapp}
                            onClick={() => {
                              handleOpenWhatsAppModal();
                              popupState.close();
                            }}
                          >
                            <WhatsApp
                              style={{ marginRight: 16, color: "#25D366" }}
                            />
                            WhatsApp
                          </MenuItem>

                          <FacebookLogin
                            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email,picture"
                            version="9.0"
                            scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                            callback={responseFacebook}
                            render={(renderProps) => (
                              <MenuItem
                                disabled={!planConfig?.plan?.useFacebook}
                                onClick={renderProps.onClick}
                              >
                                <Facebook
                                  style={{ marginRight: 16, color: "#3b5998" }}
                                />
                                Facebook
                              </MenuItem>
                            )}
                          />

                          <FacebookLogin
                            appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                            autoLoad={false}
                            fields="name,email,picture"
                            version="9.0"
                            scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                            callback={responseInstagram}
                            render={(renderProps) => (
                              <MenuItem
                                disabled={!planConfig?.plan?.useInstagram}
                                onClick={renderProps.onClick}
                              >
                                <Instagram
                                  style={{ marginRight: 16, color: "#e1306c" }}
                                />
                                Instagram
                              </MenuItem>
                            )}
                          />
                        </Menu>
                      </>
                    )}
                  </PopupState>
                </Grid>
              )}
            />
          </Grid>
        ) : (
          <Box className={classes.emptyState}>
            <Typography
              variant="h4"
              style={{ fontWeight: 700, color: "#4a5568", marginBottom: 16 }}
            >
              Nenhuma conexão encontrada
            </Typography>
            <Typography variant="h6" style={{ marginBottom: 32 }}>
              Adicione sua primeira conexão para começar a usar o sistema
            </Typography>
            <Can
              role={user.profile}
              perform="connections-page:addConnection"
              yes={() => (
                <PopupState variant="popover" popupId="empty-add-connection">
                  {(popupState) => (
                    <>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<Add />}
                        {...bindTrigger(popupState)}
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          borderRadius: "16px",
                          textTransform: "none",
                          fontWeight: 700,
                          padding: "16px 32px",
                          fontSize: "1.1rem",
                        }}
                      >
                        Adicionar Primeira Conexão
                      </Button>

                      <Menu {...bindMenu(popupState)}>
                        <MenuItem
                          disabled={!planConfig?.plan?.useWhatsapp}
                          onClick={() => {
                            handleOpenWhatsAppModal();
                            popupState.close();
                          }}
                        >
                          <WhatsApp
                            style={{ marginRight: 16, color: "#25D366" }}
                          />
                          WhatsApp
                        </MenuItem>

                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="9.0"
                          scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                          callback={responseFacebook}
                          render={(renderProps) => (
                            <MenuItem
                              disabled={!planConfig?.plan?.useFacebook}
                              onClick={renderProps.onClick}
                            >
                              <Facebook
                                style={{ marginRight: 16, color: "#3b5998" }}
                              />
                              Facebook
                            </MenuItem>
                          )}
                        />

                        <FacebookLogin
                          appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                          autoLoad={false}
                          fields="name,email,picture"
                          version="9.0"
                          scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                          callback={responseInstagram}
                          render={(renderProps) => (
                            <MenuItem
                              disabled={!planConfig?.plan?.useInstagram}
                              onClick={renderProps.onClick}
                            >
                              <Instagram
                                style={{ marginRight: 16, color: "#e1306c" }}
                              />
                              Instagram
                            </MenuItem>
                          )}
                        />
                      </Menu>
                    </>
                  )}
                </PopupState>
              )}
            />
          </Box>
        )}
      </Container>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            opacity: 0.8;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInFromTop {
          0% {
            opacity: 0;
            transform: translateY(-30px) scale(0.9);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-10px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .connection-card-enter {
          animation: fadeInUp 0.6s ease-out;
        }

        .connection-card-enter-active {
          animation: slideInRight 0.4s ease-out;
        }

        .MuiLinearProgress-bar {
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.8) 0%,
            rgba(255, 255, 255, 1) 100%
          ) !important;
        }

        .MuiLinearProgress-root {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }

        .MuiChip-root {
          transition: all 0.2s ease !important;
        }

        .MuiCard-root:hover {
          z-index: 1;
        }

        .MuiButton-root {
          transition: all 0.2s ease !important;
        }

        .MuiIconButton-root {
          transition: all 0.2s ease !important;
        }

        .connection-status-chip {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .glassmorphism-button {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.2) !important;
          border: 1px solid rgba(255, 255, 255, 0.3) !important;
        }

        .glassmorphism-button:hover {
          background: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </Box>
  );
};

export default Connections;
