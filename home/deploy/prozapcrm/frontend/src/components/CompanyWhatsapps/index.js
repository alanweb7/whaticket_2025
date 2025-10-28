import React, { useState, useCallback, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import { format, parseISO, set } from "date-fns";

import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import PopupState, { bindTrigger, bindMenu } from "material-ui-popup-state";
import { Stack, Box, Card, CardContent, Avatar, Chip } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import {
  Button,
  TableBody,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  TableRow,
  Table,
  TableHead,
  Paper,
  Tooltip,
  Typography,
  CircularProgress,
  Divider,
  Grid,
  Container,
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
  MoreVert,
  FiberManualRecord,
  AccessTime,
  Star,
  StarBorder,
} from "@material-ui/icons";

import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";

import MainContainer from "../MainContainer";
import MainHeader from "../MainHeader";
import MainHeaderButtonsWrapper from "../MainHeaderButtonsWrapper";
import Title from "../Title";
import TableRowSkeleton from "../TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";
import useCompanies from "../../hooks/useCompanies";
import api from "../../services/api";
import WhatsAppModalAdmin from "../WhatsAppModalAdmin";
import ConfirmationModal from "../ConfirmationModal";
import QrcodeModal from "../QrcodeModal";
import { i18n } from "../../translate/i18n";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  dialog: {
    "& .MuiDialog-paper": {
      borderRadius: "16px",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      minHeight: "70vh",
      maxHeight: "85vh",
    },
  },
  headerContainer: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: theme.spacing(3),
    borderRadius: "16px 16px 0 0",
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background:
        'url(\'data:image/svg+xml,<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><g fill="%23ffffff" fill-opacity="0.05"><circle cx="36" cy="24" r="2"/><circle cx="18" cy="48" r="1"/><circle cx="48" cy="12" r="1.5"/></g></svg>\')',
    },
  },
  connectionCard: {
    borderRadius: "16px",
    border: "none",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    overflow: "hidden",
    background: "white",
    "&:hover": {
      transform: "translateY(-4px)",
      boxShadow: "0 8px 30px rgba(0,0,0,0.12)",
    },
  },
  connectionCardContent: {
    padding: theme.spacing(3),
    "&:last-child": {
      paddingBottom: theme.spacing(3),
    },
  },
  statusIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
    zIndex: 2,
  },
  channelAvatar: {
    width: 56,
    height: 56,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    marginBottom: theme.spacing(2),
    boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
  },
  connectionName: {
    fontWeight: 700,
    fontSize: "1.1rem",
    color: "#2d3748",
    marginBottom: theme.spacing(1),
  },
  statusChip: {
    fontWeight: 600,
    fontSize: "0.75rem",
    borderRadius: "8px",
    height: "28px",
  },
  actionButton: {
    borderRadius: "10px",
    textTransform: "none",
    fontWeight: 600,
    padding: "8px 16px",
    boxShadow: "none",
    "&:hover": {
      boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    },
  },
  addButton: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "16px",
    padding: theme.spacing(2),
    minHeight: "200px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    border: "2px dashed rgba(102, 126, 234, 0.3)",
    cursor: "pointer",
    transition: "all 0.3s ease",
    "&:hover": {
      background: "linear-gradient(135deg, #5a6fd8 0%, #6b4190 100%)",
      transform: "translateY(-2px)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.3)",
    },
  },
  emptyState: {
    textAlign: "center",
    padding: theme.spacing(6),
    color: "#718096",
  },
  defaultBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    background: "linear-gradient(135deg, #ffd700 0%, #ffed4e 100%)",
    color: "#744210",
    zIndex: 2,
    fontWeight: 700,
    fontSize: "0.7rem",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(255,255,255,0.8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "16px",
    zIndex: 10,
  },
}));

const ConnectionStatusIndicator = ({ status }) => {
  const getStatusConfig = (status) => {
    switch (status) {
      case "CONNECTED":
        return {
          color: "#10b981",
          bgColor: "#10b98120",
          icon: <SignalCellular4Bar style={{ fontSize: 16 }} />,
          label: "Conectado",
          pulse: false,
        };
      case "DISCONNECTED":
        return {
          color: "#ef4444",
          bgColor: "#ef444420",
          icon: (
            <SignalCellularConnectedNoInternet0Bar style={{ fontSize: 16 }} />
          ),
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
          label: "Conectando...",
          pulse: true,
        };
      case "TIMEOUT":
      case "PAIRING":
        return {
          color: "#f97316",
          bgColor: "#f9731620",
          icon: (
            <SignalCellularConnectedNoInternet2Bar style={{ fontSize: 16 }} />
          ),
          label: "Timeout",
          pulse: false,
        };
      default:
        return {
          color: "#6b7280",
          bgColor: "#6b728020",
          icon: <FiberManualRecord style={{ fontSize: 16 }} />,
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
      sx={{
        backgroundColor: config.bgColor,
        color: config.color,
        fontWeight: 600,
        fontSize: "0.75rem",
        borderRadius: "8px",
        height: "28px",
        animation: config.pulse ? "pulse 2s infinite" : "none",
        "& .MuiChip-icon": {
          color: config.color,
        },
      }}
    />
  );
};

const ChannelIcon = ({ channel, size = 56 }) => {
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
      sx={{
        width: size,
        height: size,
        background: config.background,
        color: "white",
        boxShadow: `0 4px 12px ${config.color}30`,
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
  user,
  classes,
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
    const buttonStyle = {
      borderRadius: "10px",
      textTransform: "none",
      fontWeight: 600,
      fontSize: "0.8rem",
      padding: "6px 12px",
      minWidth: "auto",
      marginLeft: "4px",
    };

    switch (whatsApp.status) {
      case "qrcode":
        return (
          <Button
            variant="contained"
            size="small"
            onClick={() => handleAction(() => onQrCode(whatsApp))}
            sx={{
              ...buttonStyle,
              background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
              color: "white",
              "&:hover": {
                background: "linear-gradient(135deg, #d97706 0%, #b45309 100%)",
              },
            }}
          >
            Ver QR Code
          </Button>
        );
      case "DISCONNECTED":
        return (
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleAction(() => onStartSession(whatsApp.id))}
              sx={{
                ...buttonStyle,
                borderColor: "#3b82f6",
                color: "#3b82f6",
                "&:hover": {
                  background: "#3b82f610",
                  borderColor: "#2563eb",
                },
              }}
            >
              Tentar Novamente
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleAction(() => onRequestQr(whatsApp.id))}
              sx={{
                ...buttonStyle,
                borderColor: "#6b7280",
                color: "#6b7280",
                "&:hover": {
                  background: "#6b728010",
                },
              }}
            >
              Novo QR
            </Button>
          </Box>
        );
      case "CONNECTED":
      case "PAIRING":
      case "TIMEOUT":
        return (
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleAction(() => onDisconnect(whatsApp.id))}
            sx={{
              ...buttonStyle,
              borderColor: "#ef4444",
              color: "#ef4444",
              "&:hover": {
                background: "#ef444410",
                borderColor: "#dc2626",
              },
            }}
          >
            Desconectar
          </Button>
        );
      case "OPENING":
        return (
          <Button
            variant="outlined"
            size="small"
            disabled
            sx={{
              ...buttonStyle,
              borderColor: "#d1d5db",
              color: "#9ca3af",
            }}
          >
            Conectando...
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={classes.connectionCard}>
      {isLoading && (
        <Box className={classes.loadingOverlay}>
          <CircularProgress size={24} />
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
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          <ChannelIcon channel={whatsApp.channel} />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography className={classes.connectionName} noWrap>
              {whatsApp.name}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AccessTime style={{ fontSize: 14, color: "#9ca3af" }} />
              <Typography variant="body2" color="textSecondary">
                {format(parseISO(whatsApp.updatedAt), "dd/MM/yy HH:mm")}
              </Typography>
            </Box>

            {user.profile === "admin" && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mt: 2,
                }}
              >
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  {renderActionButtons()}
                </Box>

                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(whatsApp)}
                    sx={{
                      color: "#6b7280",
                      "&:hover": {
                        background: "#f3f4f6",
                        color: "#374151",
                      },
                    }}
                  >
                    <Edit style={{ fontSize: 18 }} />
                  </IconButton>

                  <IconButton
                    size="small"
                    onClick={() => onDelete(whatsApp.id)}
                    sx={{
                      color: "#ef4444",
                      "&:hover": {
                        background: "#fef2f2",
                        color: "#dc2626",
                      },
                    }}
                  >
                    <DeleteOutline style={{ fontSize: 18 }} />
                  </IconButton>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

const WhatsAppModalCompany = ({
  open,
  onClose,
  whatsAppId,
  filteredWhatsapps,
  companyInfos,
}) => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);
  const { list } = useCompanies();
  const [loadingComp, setLoadingComp] = useState(false);
  const { whatsApps, loading } = useContext(WhatsAppsContext);
  const [whatsAppModalOpen, setWhatsAppModalOpen] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedWhatsApp, setSelectedWhatsApp] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
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
    setConfirmModalOpen(true);
  };

  const handleSubmitConfirmationModal = async () => {
    if (confirmModalInfo.action === "disconnect") {
      try {
        await api.delete(
          `/whatsappsession/admin/${confirmModalInfo.whatsAppId}`
        );
        toast.success(i18n.t("connections.toasts.disconnected"));
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

    setConfirmModalInfo(confirmationModalInitialState);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        className={classes.dialog}
      >
        <ConfirmationModal
          title={confirmModalInfo.title}
          open={confirmModalOpen}
          onClose={setConfirmModalOpen}
          onConfirm={handleSubmitConfirmationModal}
        >
          {confirmModalInfo.message}
        </ConfirmationModal>

        <QrcodeModal
          open={qrModalOpen}
          onClose={handleCloseQrModal}
          whatsAppId={!whatsAppModalOpen && selectedWhatsApp?.id}
        />

        <WhatsAppModalAdmin
          open={whatsAppModalOpen}
          onClose={handleCloseWhatsAppModal}
          whatsAppId={!qrModalOpen && selectedWhatsApp?.id}
        />

        {/* Header */}
        <Box className={classes.headerContainer}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Conexões
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 400 }}>
                {companyInfos?.name}
              </Typography>
            </Box>

            <PopupState variant="popover" popupId="add-connection-menu">
              {(popupState) => (
                <>
                  <Button
                    {...bindTrigger(popupState)}
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      background: "rgba(255,255,255,0.2)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.3)",
                      color: "white",
                      borderRadius: "12px",
                      textTransform: "none",
                      fontWeight: 600,
                      padding: "10px 20px",
                      "&:hover": {
                        background: "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    Nova Conexão
                  </Button>

                  <Menu {...bindMenu(popupState)}>
                    <MenuItem
                      onClick={() => {
                        handleOpenWhatsAppModal();
                        popupState.close();
                      }}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        py: 1.5,
                      }}
                    >
                      <ChannelIcon channel="whatsapp" size={32} />
                      <Box>
                        <Typography fontWeight={600}>WhatsApp</Typography>
                        <Typography variant="caption" color="textSecondary">
                          Conectar via QR Code
                        </Typography>
                      </Box>
                    </MenuItem>

                    <FacebookLogin
                      appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                      autoLoad={false}
                      fields="name,email,picture"
                      version="13.0"
                      scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagementnt,business_management"
                      callback={responseFacebook}
                      render={(renderProps) => (
                        <MenuItem
                          onClick={renderProps.onClick}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 1.5,
                          }}
                        >
                          <ChannelIcon channel="facebook" size={32} />
                          <Box>
                            <Typography fontWeight={600}>Facebook</Typography>
                            <Typography variant="caption" color="textSecondary">
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
                      version="13.0"
                      scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                      callback={responseInstagram}
                      render={(renderProps) => (
                        <MenuItem
                          onClick={renderProps.onClick}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            py: 1.5,
                          }}
                        >
                          <ChannelIcon channel="instagram" size={32} />
                          <Box>
                            <Typography fontWeight={600}>Instagram</Typography>
                            <Typography variant="caption" color="textSecondary">
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
          </Box>
        </Box>

        {/* Content */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {loading ? (
            <Grid container spacing={3}>
              {[1, 2, 3, 4].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Card sx={{ borderRadius: "16px", height: 200 }}>
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress />
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          ) : filteredWhatsapps?.length > 0 ? (
            <Grid container spacing={3}>
              {filteredWhatsapps.map((whatsApp) => (
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
                    user={user}
                    classes={classes}
                  />
                </Grid>
              ))}
            </Grid>
          ) : (
            <Box className={classes.emptyState}>
              <Typography
                variant="h5"
                gutterBottom
                sx={{ fontWeight: 600, color: "#4a5568" }}
              >
                Nenhuma conexão encontrada
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                Adicione sua primeira conexão para começar a usar o sistema
              </Typography>
              <PopupState variant="popover" popupId="empty-add-connection">
                {(popupState) => (
                  <>
                    <Button
                      {...bindTrigger(popupState)}
                      variant="contained"
                      size="large"
                      startIcon={<Add />}
                      sx={{
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        borderRadius: "12px",
                        textTransform: "none",
                        fontWeight: 600,
                        padding: "12px 24px",
                      }}
                    >
                      Adicionar Conexão
                    </Button>

                    <Menu {...bindMenu(popupState)}>
                      <MenuItem
                        onClick={() => {
                          handleOpenWhatsAppModal();
                          popupState.close();
                        }}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          py: 1.5,
                        }}
                      >
                        <ChannelIcon channel="whatsapp" size={32} />
                        <Box>
                          <Typography fontWeight={600}>WhatsApp</Typography>
                          <Typography variant="caption" color="textSecondary">
                            Conectar via QR Code
                          </Typography>
                        </Box>
                      </MenuItem>

                      <FacebookLogin
                        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
                        autoLoad={false}
                        fields="name,email,picture"
                        version="13.0"
                        scope="public_profile,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagementnt,business_management"
                        callback={responseFacebook}
                        render={(renderProps) => (
                          <MenuItem
                            onClick={renderProps.onClick}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              py: 1.5,
                            }}
                          >
                            <ChannelIcon channel="facebook" size={32} />
                            <Box>
                              <Typography fontWeight={600}>Facebook</Typography>
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
                        version="13.0"
                        scope="public_profile,instagram_basic,instagram_manage_messages,pages_messaging,pages_show_list,pages_manage_metadata,pages_read_engagement,business_management"
                        callback={responseInstagram}
                        render={(renderProps) => (
                          <MenuItem
                            onClick={renderProps.onClick}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                              py: 1.5,
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
            </Box>
          )}
        </Container>
      </Dialog>

      {/* Animações CSS */}
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

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .MuiDialog-paper {
          animation: fadeIn 0.3s ease-out;
        }

        .connection-card-enter {
          opacity: 0;
          transform: translateY(20px);
        }

        .connection-card-enter-active {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default React.memo(WhatsAppModalCompany);
