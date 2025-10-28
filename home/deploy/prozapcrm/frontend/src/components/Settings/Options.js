import React, { useEffect, useState, useContext } from "react";
import {
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  Divider,
  Switch,
  FormControlLabel,
  Chip,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  useTheme,
  alpha,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Settings as SettingsIcon,
  Security as SecurityIcon,
  Payment as PaymentIcon,
  Message as MessageIcon,
  Api as ApiIcon,
  Tune as TuneIcon,
  Shield as ShieldIcon,
  Notifications as NotificationsIcon,
} from "@mui/icons-material";
import { makeStyles } from "@material-ui/core/styles";
import { ToastContainer, toast } from "react-toastify";
import useSettings from "../../hooks/useSettings";
import { i18n } from "../../translate/i18n";
import useCompanySettings from "../../hooks/useSettings/companySettings";

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.mode === "dark" ? "#0a0e27" : "#f8fafc",
    minHeight: "100vh",
    padding: theme.spacing(3),
  },
  sectionCard: {
    borderRadius: 16,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0,0,0,0.3)"
        : "0 2px 12px rgba(0,0,0,0.08)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.06)",
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(145deg, #1a1f3a 0%, #0f1419 100%)"
        : "#ffffff",
    marginBottom: theme.spacing(3),
    overflow: "hidden",
  },
  sectionHeader: {
    padding: theme.spacing(3),
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
        : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    gap: theme.spacing(2),
  },
  sectionContent: { padding: theme.spacing(3) },
  modernField: {
    "& .MuiOutlinedInput-root": {
      borderRadius: 12,
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.05)"
          : "rgba(0,0,0,0.02)",
      transition: "all 0.3s ease",
      "&:hover": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.08)"
            : "rgba(0,0,0,0.04)",
      },
      "&.Mui-focused": {
        backgroundColor:
          theme.palette.mode === "dark"
            ? "rgba(255,255,255,0.1)"
            : "rgba(0,0,0,0.02)",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 0 0 2px rgba(103, 126, 234, 0.3)"
            : "0 0 0 2px rgba(103, 126, 234, 0.2)",
      },
    },
    "& .MuiInputLabel-root": { fontSize: "0.875rem", fontWeight: 500 },
  },
  switchField: {
    padding: theme.spacing(2),
    borderRadius: 12,
    backgroundColor:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.05)"
        : "rgba(0,0,0,0.02)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.06)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor:
        theme.palette.mode === "dark"
          ? "rgba(255,255,255,0.08)"
          : "rgba(0,0,0,0.04)",
    },
  },
  accordionSection: {
    borderRadius: "16px !important",
    marginBottom: theme.spacing(2),
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 2px 8px rgba(0,0,0,0.3)"
        : "0 1px 4px rgba(0,0,0,0.08)",
    border:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.06)",
    background: theme.palette.mode === "dark" ? "#1a1f3a" : "#ffffff",
    "&:before": { display: "none" },
  },
  accordionSummary: {
    borderRadius: "16px !important",
    padding: theme.spacing(2, 3),
    minHeight: "72px !important",
    "& .MuiAccordionSummary-content": { alignItems: "center" },
  },
  accordionDetails: {
    padding: theme.spacing(2, 3, 3, 3),
    borderTop:
      theme.palette.mode === "dark"
        ? "1px solid rgba(255,255,255,0.1)"
        : "1px solid rgba(0,0,0,0.06)",
  },
  titleSection: {
    textAlign: "center",
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    background:
      theme.palette.mode === "dark"
        ? "linear-gradient(135deg, #1a1f3a 0%, #0f1419 100%)"
        : "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: 20,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 20px rgba(0,0,0,0.3)"
        : "0 2px 12px rgba(0,0,0,0.08)",
  },
}));

const ModernSwitch = ({
  label,
  value,
  onChange,
  loading,
  helperText,
  icon,
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const isChecked = value === "enabled" || value === true || value === "true";
  return (
    <Box className={classes.switchField}>
      <FormControlLabel
        control={
          <Switch
            checked={isChecked}
            onChange={(e) =>
              onChange(e.target.checked ? "enabled" : "disabled")
            }
            disabled={loading}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "#667eea",
                "&:hover": { backgroundColor: alpha("#667eea", 0.08) },
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#667eea",
              },
            }}
          />
        }
        label={
          <Box display="flex" alignItems="center" gap={1}>
            {icon}
            <Typography variant="body2" fontWeight={500}>
              {label}
            </Typography>
          </Box>
        }
      />
      {loading && (
        <Typography
          variant="caption"
          color="primary"
          sx={{ ml: 2, mt: 1, display: "block" }}
        >
          {helperText || "Atualizando..."}
        </Typography>
      )}
    </Box>
  );
};

const ModernSelect = ({
  label,
  value,
  onChange,
  options,
  loading,
  helperText,
  fullWidth = true,
}) => {
  const classes = useStyles();
  return (
    <FormControl
      fullWidth={fullWidth}
      className={classes.modernField}
      margin="normal"
      disabled={loading}
    >
      <InputLabel>{label}</InputLabel>
      <Select value={value || ""} onChange={onChange} label={label}>
        {options.map((option, index) => (
          <MenuItem key={index} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {loading && (
        <FormHelperText sx={{ color: "primary.main" }}>
          {helperText || "Atualizando..."}
        </FormHelperText>
      )}
    </FormControl>
  );
};

const ModernTextField = ({
  label,
  value,
  onChange,
  loading,
  helperText,
  multiline = false,
  rows = 1,
  type = "text",
}) => {
  const classes = useStyles();
  return (
    <TextField
      fullWidth
      label={label}
      value={value || ""}
      onChange={onChange}
      multiline={multiline}
      rows={rows}
      type={type}
      margin="normal"
      variant="outlined"
      className={classes.modernField}
      disabled={loading}
      helperText={loading ? helperText || "Atualizando..." : ""}
      FormHelperTextProps={{
        sx: { color: loading ? "primary.main" : "text.secondary" },
      }}
    />
  );
};

export default function Options(props) {
  const { oldSettings, settings, scheduleTypeChanged, user } = props;
  const classes = useStyles();
  const theme = useTheme();
  const [userRating, setUserRating] = useState("disabled");
  const [scheduleType, setScheduleType] = useState("disabled");
  const [chatBotType, setChatBotType] = useState("text");
  const [loadingUserRating, setLoadingUserRating] = useState(false);
  const [loadingScheduleType, setLoadingScheduleType] = useState(false);
  const [userCreation, setUserCreation] = useState("disabled");
  const [loadingUserCreation, setLoadingUserCreation] = useState(false);
  const [SendGreetingAccepted, setSendGreetingAccepted] = useState("enabled");
  const [loadingSendGreetingAccepted, setLoadingSendGreetingAccepted] =
    useState(false);
  const [UserRandom, setUserRandom] = useState("enabled");
  const [loadingUserRandom, setLoadingUserRandom] = useState(false);
  const [SettingsTransfTicket, setSettingsTransfTicket] = useState("enabled");
  const [loadingSettingsTransfTicket, setLoadingSettingsTransfTicket] =
    useState(false);
  const [AcceptCallWhatsapp, setAcceptCallWhatsapp] = useState("enabled");
  const [loadingAcceptCallWhatsapp, setLoadingAcceptCallWhatsapp] =
    useState(false);
  const [sendSignMessage, setSendSignMessage] = useState("enabled");
  const [loadingSendSignMessage, setLoadingSendSignMessage] = useState(false);
  const [sendGreetingMessageOneQueues, setSendGreetingMessageOneQueues] =
    useState("enabled");
  const [
    loadingSendGreetingMessageOneQueues,
    setLoadingSendGreetingMessageOneQueues,
  ] = useState(false);
  const [sendQueuePosition, setSendQueuePosition] = useState("enabled");
  const [loadingSendQueuePosition, setLoadingSendQueuePosition] =
    useState(false);
  const [sendFarewellWaitingTicket, setSendFarewellWaitingTicket] =
    useState("enabled");
  const [
    loadingSendFarewellWaitingTicket,
    setLoadingSendFarewellWaitingTicket,
  ] = useState(false);
  const [acceptAudioMessageContact, setAcceptAudioMessageContact] =
    useState("enabled");
  const [
    loadingAcceptAudioMessageContact,
    setLoadingAcceptAudioMessageContact,
  ] = useState(false);
  const [eficlientidType, setEfiClientidType] = useState("");
  const [loadingEfiClientidType, setLoadingEfiClientidType] = useState(false);
  const [eficlientsecretType, setEfiClientsecretType] = useState("");
  const [loadingEfiClientsecretType, setLoadingEfiClientsecretType] =
    useState(false);
  const [efichavepixType, setEfiChavepixType] = useState("");
  const [loadingEfiChavepixType, setLoadingEfiChavepixType] = useState(false);
  const [mpaccesstokenType, setmpaccesstokenType] = useState("");
  const [loadingmpaccesstokenType, setLoadingmpaccesstokenType] =
    useState(false);
  const [stripeprivatekeyType, setstripeprivatekeyType] = useState("");
  const [loadingstripeprivatekeyType, setLoadingstripeprivatekeyType] =
    useState(false);
  const [asaastokenType, setasaastokenType] = useState("");
  const [loadingasaastokenType, setLoadingasaastokenType] = useState(false);
  const [openaitokenType, setopenaitokenType] = useState("");
  const [loadingopenaitokenType, setLoadingopenaitokenType] = useState(false);
  const [enableLGPD, setEnableLGPD] = useState("disabled");
  const [loadingEnableLGPD, setLoadingEnableLGPD] = useState(false);
  const [lgpdMessage, setLGPDMessage] = useState("");
  const [loadinglgpdMessage, setLoadingLGPDMessage] = useState(false);
  const [lgpdLink, setLGPDLink] = useState("");
  const [loadingLGPDLink, setLoadingLGPDLink] = useState(false);
  const [lgpdDeleteMessage, setLGPDDeleteMessage] = useState("disabled");
  const [loadingLGPDDeleteMessage, setLoadingLGPDDeleteMessage] =
    useState(false);
  const [downloadLimit, setdownloadLimit] = useState("64");
  const [loadingDownloadLimit, setLoadingdownloadLimit] = useState(false);
  const [lgpdConsent, setLGPDConsent] = useState("disabled");
  const [loadingLGPDConsent, setLoadingLGPDConsent] = useState(false);
  const [lgpdHideNumber, setLGPDHideNumber] = useState("disabled");
  const [loadingLGPDHideNumber, setLoadingLGPDHideNumber] = useState(false);
  const [requiredTag, setRequiredTag] = useState("enabled");
  const [loadingRequiredTag, setLoadingRequiredTag] = useState(false);
  const [closeTicketOnTransfer, setCloseTicketOnTransfer] =
    useState("disabled");
  const [loadingCloseTicketOnTransfer, setLoadingCloseTicketOnTransfer] =
    useState(false);
  const [directTicketsToWallets, setDirectTicketsToWallets] =
    useState("disabled");
  const [loadingDirectTicketsToWallets, setLoadingDirectTicketsToWallets] =
    useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [loadingTransferMessage, setLoadingTransferMessage] = useState(false);
  const [greetingAcceptedMessage, setGreetingAcceptedMessage] = useState("");
  const [loadingGreetingAcceptedMessage, setLoadingGreetingAcceptedMessage] =
    useState(false);
  const [AcceptCallWhatsappMessage, setAcceptCallWhatsappMessage] =
    useState("");
  const [
    loadingAcceptCallWhatsappMessage,
    setLoadingAcceptCallWhatsappMessage,
  ] = useState(false);
  const [sendQueuePositionMessage, setSendQueuePositionMessage] = useState("");
  const [loadingSendQueuePositionMessage, setLoadingSendQueuePositionMessage] =
    useState(false);
  const [showNotificationPending, setShowNotificationPending] =
    useState("disabled");
  const [loadingShowNotificationPending, setLoadingShowNotificationPending] =
    useState(false);

  const { update: updateUserCreation } = useSettings();
  const { update: updatedownloadLimit } = useSettings();
  const { update: updateeficlientid } = useSettings();
  const { update: updateeficlientsecret } = useSettings();
  const { update: updateefichavepix } = useSettings();
  const { update: updatempaccesstoken } = useSettings();
  const { update: updatestripeprivatekey } = useSettings();
  const { update: updateasaastoken } = useSettings();
  const { update: updateopenaitoken } = useSettings();
  const { update } = useCompanySettings();

  const isSuper = () => {
    return user && user.super;
  };

  useEffect(() => {
    if (Array.isArray(oldSettings) && oldSettings.length) {
      const userPar = oldSettings.find((s) => s.key === "userCreation");
      if (userPar) {
        setUserCreation(userPar.value);
      }
      const downloadLimitSetting = oldSettings.find(
        (s) => s.key === "downloadLimit"
      );
      if (downloadLimitSetting) {
        setdownloadLimit(downloadLimitSetting.value);
      }
      const eficlientidSetting = oldSettings.find(
        (s) => s.key === "eficlientid"
      );
      if (eficlientidSetting) {
        setEfiClientidType(eficlientidSetting.value);
      }
      const eficlientsecretSetting = oldSettings.find(
        (s) => s.key === "eficlientsecret"
      );
      if (eficlientsecretSetting) {
        setEfiClientsecretType(eficlientsecretSetting.value);
      }
      const efichavepixSetting = oldSettings.find(
        (s) => s.key === "efichavepix"
      );
      if (efichavepixSetting) {
        setEfiChavepixType(efichavepixSetting.value);
      }
      const mpaccesstokenSetting = oldSettings.find(
        (s) => s.key === "mpaccesstoken"
      );
      if (mpaccesstokenSetting) {
        setmpaccesstokenType(mpaccesstokenSetting.value);
      }
      const asaastokenSetting = oldSettings.find((s) => s.key === "asaastoken");
      if (asaastokenSetting) {
        setasaastokenType(asaastokenSetting.value);
      }
      const openaitokenSetting = oldSettings.find(
        (s) => s.key === "openaikeyaudio"
      );
      if (openaitokenSetting) {
        setopenaitokenType(openaitokenSetting.value);
      }
    }
  }, [oldSettings]);

  useEffect(() => {
    if (settings && typeof settings === "object") {
      for (const [key, value] of Object.entries(settings)) {
        if (key === "userRating") setUserRating(value);
        if (key === "scheduleType") setScheduleType(value);
        if (key === "chatBotType") setChatBotType(value);
        if (key === "acceptCallWhatsapp") setAcceptCallWhatsapp(value);
        if (key === "userRandom") setUserRandom(value);
        if (key === "sendGreetingMessageOneQueues")
          setSendGreetingMessageOneQueues(value);
        if (key === "sendSignMessage") setSendSignMessage(value);
        if (key === "sendFarewellWaitingTicket")
          setSendFarewellWaitingTicket(value);
        if (key === "sendGreetingAccepted") setSendGreetingAccepted(value);
        if (key === "sendQueuePosition") setSendQueuePosition(value);
        if (key === "acceptAudioMessageContact")
          setAcceptAudioMessageContact(value);
        if (key === "enableLGPD") setEnableLGPD(value);
        if (key === "requiredTag") setRequiredTag(value);
        if (key === "lgpdDeleteMessage") setLGPDDeleteMessage(value);
        if (key === "lgpdHideNumber") setLGPDHideNumber(value);
        if (key === "lgpdConsent") setLGPDConsent(value);
        if (key === "lgpdMessage") setLGPDMessage(value);
        if (key === "sendMsgTransfTicket") setSettingsTransfTicket(value);
        if (key === "lgpdLink") setLGPDLink(value);
        if (key === "DirectTicketsToWallets") setDirectTicketsToWallets(value);
        if (key === "closeTicketOnTransfer") setCloseTicketOnTransfer(value);
        if (key === "transferMessage") setTransferMessage(value);
        if (key === "greetingAcceptedMessage")
          setGreetingAcceptedMessage(value);
        if (key === "AcceptCallWhatsappMessage")
          setAcceptCallWhatsappMessage(value);
        if (key === "sendQueuePositionMessage")
          setSendQueuePositionMessage(value);
        if (key === "showNotificationPending")
          setShowNotificationPending(value);
      }
    }
  }, [settings]);

  async function handleChangeUserCreation(value) {
    setUserCreation(value);
    setLoadingUserCreation(true);
    try {
      await updateUserCreation({ key: "userCreation", value });
      toast.success(
        "Configuração de criação de usuários atualizada com sucesso."
      );
    } catch (error) {
      toast.error("Erro ao atualizar configuração de criação de usuários.");
      console.error("Error updating userCreation:", error);
    } finally {
      setLoadingUserCreation(false);
    }
  }

  async function handleDownloadLimit(value) {
    setdownloadLimit(value);
    setLoadingdownloadLimit(true);
    try {
      await updatedownloadLimit({ key: "downloadLimit", value });
      toast.success("Limite de download atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar limite de download.");
      console.error("Error updating downloadLimit:", error);
    } finally {
      setLoadingdownloadLimit(false);
    }
  }

  async function handleChangeEfiClientid(value) {
    setEfiClientidType(value);
    setLoadingEfiClientidType(true);
    try {
      await updateeficlientid({ key: "eficlientid", value });
      toast.success("Client ID Efi atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar Client ID Efi.");
      console.error("Error updating eficlientid:", error);
    } finally {
      setLoadingEfiClientidType(false);
    }
  }

  async function handleChangeEfiClientsecret(value) {
    setEfiClientsecretType(value);
    setLoadingEfiClientsecretType(true);
    try {
      await updateeficlientsecret({ key: "eficlientsecret", value });
      toast.success("Client Secret Efi atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar Client Secret Efi.");
      console.error("Error updating eficlientsecret:", error);
    } finally {
      setLoadingEfiClientsecretType(false);
    }
  }

  async function handleChangeEfiChavepix(value) {
    setEfiChavepixType(value);
    setLoadingEfiChavepixType(true);
    try {
      await updateefichavepix({ key: "efichavepix", value });
      toast.success("Chave PIX Efi atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar Chave PIX Efi.");
      console.error("Error updating efichavepix:", error);
    } finally {
      setLoadingEfiChavepixType(false);
    }
  }

  async function handleChangempaccesstoken(value) {
    setmpaccesstokenType(value);
    setLoadingmpaccesstokenType(true);
    try {
      await updatempaccesstoken({ key: "mpaccesstoken", value });
      toast.success("Token Mercado Pago atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar token Mercado Pago.");
      console.error("Error updating mpaccesstoken:", error);
    } finally {
      setLoadingmpaccesstokenType(false);
    }
  }

  async function handleChangestripeprivatekey(value) {
    setstripeprivatekeyType(value);
    setLoadingstripeprivatekeyType(true);
    try {
      await updatestripeprivatekey({ key: "stripeprivatekey", value });
      toast.success("Chave privada Stripe atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar chave privada Stripe.");
      console.error("Error updating stripeprivatekey:", error);
    } finally {
      setLoadingstripeprivatekeyType(false);
    }
  }

  async function handleChangeasaastoken(value) {
    setasaastokenType(value);
    setLoadingasaastokenType(true);
    try {
      await updateasaastoken({ key: "asaastoken", value });
      toast.success("Token ASAAS atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar token ASAAS.");
      console.error("Error updating asaastoken:", error);
    } finally {
      setLoadingasaastokenType(false);
    }
  }

  async function handleChangeopenaitoken(value) {
    setopenaitokenType(value);
    setLoadingopenaitokenType(true);
    try {
      await updateopenaitoken({ key: "openaikeyaudio", value });
      toast.success("Token OpenAI atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar token OpenAI.");
      console.error("Error updating openaikeyaudio:", error);
    } finally {
      setLoadingopenaitokenType(false);
    }
  }

  async function handleChangeUserRating(value) {
    setUserRating(value);
    setLoadingUserRating(true);
    try {
      await update({ column: "userRating", data: value });
      toast.success("Sistema de avaliações atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar sistema de avaliações.");
      console.error("Error updating userRating:", error);
    } finally {
      setLoadingUserRating(false);
    }
  }

  async function handleScheduleType(value) {
    setScheduleType(value);
    setLoadingScheduleType(true);
    try {
      await update({ column: "scheduleType", data: value });
      toast.success("Tipo de agendamento atualizado com sucesso.");
      if (typeof scheduleTypeChanged === "function") {
        scheduleTypeChanged(value);
      }
    } catch (error) {
      toast.error("Erro ao atualizar tipo de agendamento.");
      console.error("Error updating scheduleType:", error);
    } finally {
      setLoadingScheduleType(false);
    }
  }

  async function handleChatBotType(value) {
    setChatBotType(value);
    try {
      await update({ column: "chatBotType", data: value });
      toast.success("Tipo de chatbot atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar tipo de chatbot.");
      console.error("Error updating chatBotType:", error);
    }
  }

  async function handleLGPDMessage(value) {
    setLGPDMessage(value);
    setLoadingLGPDMessage(true);
    try {
      await update({ column: "lgpdMessage", data: value });
      toast.success("Mensagem LGPD atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem LGPD.");
      console.error("Error updating lgpdMessage:", error);
    } finally {
      setLoadingLGPDMessage(false);
    }
  }

  async function handletransferMessage(value) {
    setTransferMessage(value);
    setLoadingTransferMessage(true);
    try {
      await update({ column: "transferMessage", data: value });
      toast.success("Mensagem de transferência atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem de transferência.");
      console.error("Error updating transferMessage:", error);
    } finally {
      setLoadingTransferMessage(false);
    }
  }

  async function handleGreetingAcceptedMessage(value) {
    setGreetingAcceptedMessage(value);
    setLoadingGreetingAcceptedMessage(true);
    try {
      await update({ column: "greetingAcceptedMessage", data: value });
      toast.success("Mensagem de saudação atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem de saudação.");
      console.error("Error updating greetingAcceptedMessage:", error);
    } finally {
      setLoadingGreetingAcceptedMessage(false);
    }
  }

  async function handleAcceptCallWhatsappMessage(value) {
    setAcceptCallWhatsappMessage(value);
    setLoadingAcceptCallWhatsappMessage(true);
    try {
      await update({ column: "AcceptCallWhatsappMessage", data: value });
      toast.success("Mensagem sobre chamadas atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem sobre chamadas.");
      console.error("Error updating AcceptCallWhatsappMessage:", error);
    } finally {
      setLoadingAcceptCallWhatsappMessage(false);
    }
  }

  async function handlesendQueuePositionMessage(value) {
    setSendQueuePositionMessage(value);
    setLoadingSendQueuePositionMessage(true);
    try {
      await update({ column: "sendQueuePositionMessage", data: value });
      toast.success("Mensagem de posição na fila atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem de posição na fila.");
      console.error("Error updating sendQueuePositionMessage:", error);
    } finally {
      setLoadingSendQueuePositionMessage(false);
    }
  }

  async function handleShowNotificationPending(value) {
    setShowNotificationPending(value);
    setLoadingShowNotificationPending(true);
    try {
      await update({ column: "showNotificationPending", data: value });
      toast.success("Notificações pendentes atualizadas com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar notificações pendentes.");
      console.error("Error updating showNotificationPending:", error);
    } finally {
      setLoadingShowNotificationPending(false);
    }
  }

  async function handleLGPDLink(value) {
    setLGPDLink(value);
    setLoadingLGPDLink(true);
    try {
      await update({ column: "lgpdLink", data: value });
      toast.success("Link LGPD atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar link LGPD.");
      console.error("Error updating lgpdLink:", error);
    } finally {
      setLoadingLGPDLink(false);
    }
  }

  async function handleLGPDDeleteMessage(value) {
    setLGPDDeleteMessage(value);
    setLoadingLGPDDeleteMessage(true);
    try {
      await update({ column: "lgpdDeleteMessage", data: value });
      toast.success("Configuração de exclusão LGPD atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar configuração de exclusão LGPD.");
      console.error("Error updating lgpdDeleteMessage:", error);
    } finally {
      setLoadingLGPDDeleteMessage(false);
    }
  }

  async function handleLGPDConsent(value) {
    setLGPDConsent(value);
    setLoadingLGPDConsent(true);
    try {
      await update({ column: "lgpdConsent", data: value });
      toast.success(
        "Configuração de consentimento LGPD atualizada com sucesso."
      );
    } catch (error) {
      toast.error("Erro ao atualizar configuração de consentimento LGPD.");
      console.error("Error updating lgpdConsent:", error);
    } finally {
      setLoadingLGPDConsent(false);
    }
  }

  async function handleLGPDHideNumber(value) {
    setLGPDHideNumber(value);
    setLoadingLGPDHideNumber(true);
    try {
      await update({ column: "lgpdHideNumber", data: value });
      toast.success(
        "Configuração de ocultar número LGPD atualizada com sucesso."
      );
    } catch (error) {
      toast.error("Erro ao atualizar configuração de ocultar número LGPD.");
      console.error("Error updating lgpdHideNumber:", error);
    } finally {
      setLoadingLGPDHideNumber(false);
    }
  }

  async function handleSendGreetingAccepted(value) {
    setSendGreetingAccepted(value);
    setLoadingSendGreetingAccepted(true);
    try {
      await update({ column: "sendGreetingAccepted", data: value });
      toast.success("Envio de saudação atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar envio de saudação.");
      console.error("Error updating sendGreetingAccepted:", error);
    } finally {
      setLoadingSendGreetingAccepted(false);
    }
  }

  async function handleUserRandom(value) {
    setUserRandom(value);
    setLoadingUserRandom(true);
    try {
      await update({ column: "userRandom", data: value });
      toast.success("Operador aleatório atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar operador aleatório.");
      console.error("Error updating userRandom:", error);
    } finally {
      setLoadingUserRandom(false);
    }
  }

  async function handleSettingsTransfTicket(value) {
    setSettingsTransfTicket(value);
    setLoadingSettingsTransfTicket(true);
    try {
      await update({ column: "sendMsgTransfTicket", data: value });
      toast.success(
        "Mensagem de transferência de ticket atualizada com sucesso."
      );
    } catch (error) {
      toast.error("Erro ao atualizar mensagem de transferência de ticket.");
      console.error("Error updating sendMsgTransfTicket:", error);
    } finally {
      setLoadingSettingsTransfTicket(false);
    }
  }

  async function handleAcceptCallWhatsapp(value) {
    setAcceptCallWhatsapp(value);
    setLoadingAcceptCallWhatsapp(true);
    try {
      await update({ column: "acceptCallWhatsapp", data: value });
      toast.success("Aceitar chamadas WhatsApp atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar aceitar chamadas WhatsApp.");
      console.error("Error updating acceptCallWhatsapp:", error);
    } finally {
      setLoadingAcceptCallWhatsapp(false);
    }
  }

  async function handleSendSignMessage(value) {
    setSendSignMessage(value);
    setLoadingSendSignMessage(true);
    try {
      await update({ column: "sendSignMessage", data: value });
      toast.success("Envio de assinatura atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar envio de assinatura.");
      console.error("Error updating sendSignMessage:", error);
    } finally {
      setLoadingSendSignMessage(false);
    }
  }

  async function handleSendGreetingMessageOneQueues(value) {
    setSendGreetingMessageOneQueues(value);
    setLoadingSendGreetingMessageOneQueues(true);
    try {
      await update({ column: "sendGreetingMessageOneQueues", data: value });
      toast.success("Saudação uma fila atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar saudação uma fila.");
      console.error("Error updating sendGreetingMessageOneQueues:", error);
    } finally {
      setLoadingSendGreetingMessageOneQueues(false);
    }
  }

  async function handleSendQueuePosition(value) {
    setSendQueuePosition(value);
    setLoadingSendQueuePosition(true);
    try {
      await update({ column: "sendQueuePosition", data: value });
      toast.success("Posição na fila atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar posição na fila.");
      console.error("Error updating sendQueuePosition:", error);
    } finally {
      setLoadingSendQueuePosition(false);
    }
  }

  async function handleSendFarewellWaitingTicket(value) {
    setSendFarewellWaitingTicket(value);
    setLoadingSendFarewellWaitingTicket(true);
    try {
      await update({ column: "sendFarewellWaitingTicket", data: value });
      toast.success("Mensagem de despedida atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar mensagem de despedida.");
      console.error("Error updating sendFarewellWaitingTicket:", error);
    } finally {
      setLoadingSendFarewellWaitingTicket(false);
    }
  }

  async function handleAcceptAudioMessageContact(value) {
    setAcceptAudioMessageContact(value);
    setLoadingAcceptAudioMessageContact(true);
    try {
      await update({ column: "acceptAudioMessageContact", data: value });
      toast.success("Aceitar áudio de contatos atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar aceitar áudio de contatos.");
      console.error("Error updating acceptAudioMessageContact:", error);
    } finally {
      setLoadingAcceptAudioMessageContact(false);
    }
  }

  async function handleEnableLGPD(value) {
    setEnableLGPD(value);
    setLoadingEnableLGPD(true);
    try {
      await update({ column: "enableLGPD", data: value });
      toast.success("LGPD atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar LGPD.");
      console.error("Error updating enableLGPD:", error);
    } finally {
      setLoadingEnableLGPD(false);
    }
  }

  async function handleRequiredTag(value) {
    setRequiredTag(value);
    setLoadingRequiredTag(true);
    try {
      await update({ column: "requiredTag", data: value });
      toast.success("Tag obrigatória atualizada com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar tag obrigatória.");
      console.error("Error updating requiredTag:", error);
    } finally {
      setLoadingRequiredTag(false);
    }
  }

  async function handleCloseTicketOnTransfer(value) {
    setCloseTicketOnTransfer(value);
    setLoadingCloseTicketOnTransfer(true);
    try {
      await update({ column: "closeTicketOnTransfer", data: value });
      toast.success("Fechar ticket na transferência atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar fechar ticket na transferência.");
      console.error("Error updating closeTicketOnTransfer:", error);
    } finally {
      setLoadingCloseTicketOnTransfer(false);
    }
  }

  async function handleDirectTicketsToWallets(value) {
    setDirectTicketsToWallets(value);
    setLoadingDirectTicketsToWallets(true);
    try {
      await update({ column: "DirectTicketsToWallets", data: value });
      toast.success("Direcionar para carteiras atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar direcionar para carteiras.");
      console.error("Error updating DirectTicketsToWallets:", error);
    } finally {
      setLoadingDirectTicketsToWallets(false);
    }
  }

  return (
    <Container maxWidth="xl" className={classes.root}>
      <Box className={classes.titleSection}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          <SettingsIcon
            sx={{ mr: 2, verticalAlign: "middle", fontSize: "2rem" }}
          />
          Configurações do Sistema
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure as opções gerais, integrações e funcionalidades do sistema
        </Typography>
      </Box>

      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <TuneIcon />
          <Typography variant="h6" fontWeight="bold">
            Configurações Gerais
          </Typography>
        </Box>
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Sistema de Avaliações"
                value={userRating}
                onChange={handleChangeUserRating}
                loading={loadingUserRating}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSelect
                label="Agendamento de Expediente"
                value={scheduleType}
                onChange={(e) => handleScheduleType(e.target.value)}
                loading={loadingScheduleType}
                options={[
                  { value: "disabled", label: "Desabilitado" },
                  { value: "queue", label: "Por Fila" },
                  { value: "company", label: "Por Empresa" },
                  { value: "connection", label: "Por Conexão" },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSelect
                label="Tipo do ChatBot"
                value={chatBotType}
                onChange={(e) => handleChatBotType(e.target.value)}
                options={[
                  { value: "text", label: "Texto" },
                  { value: "list", label: "Lista" },
                  { value: "button", label: "Botões" },
                ]}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Enviar Saudação ao Aceitar"
                value={SendGreetingAccepted}
                onChange={handleSendGreetingAccepted}
                loading={loadingSendGreetingAccepted}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Operador Aleatório"
                value={UserRandom}
                onChange={handleUserRandom}
                loading={loadingUserRandom}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Mensagem de Transferência"
                value={SettingsTransfTicket}
                onChange={handleSettingsTransfTicket}
                loading={loadingSettingsTransfTicket}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Habilitar LGPD"
                value={enableLGPD}
                onChange={handleEnableLGPD}
                loading={loadingEnableLGPD}
                icon={<ShieldIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Mostrar Notificações Pendentes"
                value={showNotificationPending}
                onChange={handleShowNotificationPending}
                loading={loadingShowNotificationPending}
                icon={<NotificationsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {enableLGPD === "enabled" && (
        <Card className={classes.sectionCard}>
          <Box className={classes.sectionHeader}>
            <ShieldIcon />
            <Typography variant="h6" fontWeight="bold">
              Configurações LGPD
            </Typography>
          </Box>
          <Box className={classes.sectionContent}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ModernTextField
                  label="Mensagem de Boas-vindas LGPD"
                  value={lgpdMessage}
                  onChange={(e) => handleLGPDMessage(e.target.value)}
                  loading={loadinglgpdMessage}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12}>
                <ModernTextField
                  label="Link da Política de Privacidade"
                  value={lgpdLink}
                  onChange={(e) => handleLGPDLink(e.target.value)}
                  loading={loadingLGPDLink}
                  type="url"
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <ModernSwitch
                  label="Ofuscar Mensagens Deletadas"
                  value={lgpdDeleteMessage}
                  onChange={handleLGPDDeleteMessage}
                  loading={loadingLGPDDeleteMessage}
                  icon={<SecurityIcon sx={{ fontSize: 20 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <ModernSwitch
                  label="Sempre Solicitar Consentimento"
                  value={lgpdConsent}
                  onChange={handleLGPDConsent}
                  loading={loadingLGPDConsent}
                  icon={<SecurityIcon sx={{ fontSize: 20 }} />}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <ModernSwitch
                  label="Ofuscar Número do Telefone"
                  value={lgpdHideNumber}
                  onChange={handleLGPDHideNumber}
                  loading={loadingLGPDHideNumber}
                  icon={<SecurityIcon sx={{ fontSize: 20 }} />}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}

      <Card className={classes.sectionCard}>
        <Box className={classes.sectionHeader}>
          <MessageIcon />
          <Typography variant="h6" fontWeight="bold">
            Mensagens Personalizadas
          </Typography>
        </Box>
        <Box className={classes.sectionContent}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <ModernTextField
                label="Mensagem de Transferência"
                value={transferMessage}
                onChange={(e) => handletransferMessage(e.target.value)}
                loading={loadingTransferMessage}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ModernTextField
                label="Mensagem de Saudação"
                value={greetingAcceptedMessage}
                onChange={(e) => handleGreetingAcceptedMessage(e.target.value)}
                loading={loadingGreetingAcceptedMessage}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ModernTextField
                label="Mensagem sobre Chamadas"
                value={AcceptCallWhatsappMessage}
                onChange={(e) =>
                  handleAcceptCallWhatsappMessage(e.target.value)
                }
                loading={loadingAcceptCallWhatsappMessage}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <ModernTextField
                label="Mensagem de Posição na Fila"
                value={sendQueuePositionMessage}
                onChange={(e) => handlesendQueuePositionMessage(e.target.value)}
                loading={loadingSendQueuePositionMessage}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </Box>
      </Card>

      {isSuper() && (
        <Accordion className={classes.accordionSection}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            className={classes.accordionSummary}
          >
            <PaymentIcon sx={{ mr: 2 }} />
            <Typography variant="h6" fontWeight="bold">
              Integrações de Pagamento
            </Typography>
          </AccordionSummary>
          <AccordionDetails className={classes.accordionDetails}>
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                PIX Efí (GerenciaNet)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <ModernTextField
                    label="Client ID"
                    value={eficlientidType}
                    onChange={(e) => handleChangeEfiClientid(e.target.value)}
                    loading={loadingEfiClientidType}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ModernTextField
                    label="Client Secret"
                    value={eficlientsecretType}
                    onChange={(e) =>
                      handleChangeEfiClientsecret(e.target.value)
                    }
                    loading={loadingEfiClientsecretType}
                    type="password"
                  />
                </Grid>
                <Grid item xs={12}>
                  <ModernTextField
                    label="Chave PIX"
                    value={efichavepixType}
                    onChange={(e) => handleChangeEfiChavepix(e.target.value)}
                    loading={loadingEfiChavepixType}
                  />
                </Grid>
              </Grid>
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Mercado Pago
              </Typography>
              <ModernTextField
                label="Access Token"
                value={mpaccesstokenType}
                onChange={(e) => handleChangempaccesstoken(e.target.value)}
                loading={loadingmpaccesstokenType}
                type="password"
              />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box mb={3}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Stripe
              </Typography>
              <ModernTextField
                label="Private Key"
                value={stripeprivatekeyType}
                onChange={(e) => handleChangestripeprivatekey(e.target.value)}
                loading={loadingstripeprivatekeyType}
                type="password"
              />
            </Box>
            <Divider sx={{ my: 3 }} />
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ASAAS
              </Typography>
              <ModernTextField
                label="Token ASAAS"
                value={asaastokenType}
                onChange={(e) => handleChangeasaastoken(e.target.value)}
                loading={loadingasaastokenType}
                type="password"
              />
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {isSuper() && (
        <Card className={classes.sectionCard}>
          <Box className={classes.sectionHeader}>
            <ApiIcon />
            <Typography variant="h6" fontWeight="bold">
              Integrações de API
            </Typography>
          </Box>
          <Box className={classes.sectionContent}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <ModernTextField
                  label="OpenAI API Key (Transcrição de Áudio)"
                  value={openaitokenType}
                  onChange={(e) => handleChangeopenaitoken(e.target.value)}
                  loading={loadingopenaitokenType}
                  type="password"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ModernSelect
                  label="Limite de Download (MB)"
                  value={downloadLimit}
                  onChange={(e) => handleDownloadLimit(e.target.value)}
                  loading={loadingDownloadLimit}
                  options={[
                    { value: "32", label: "32 MB" },
                    { value: "64", label: "64 MB" },
                    { value: "128", label: "128 MB" },
                    { value: "256", label: "256 MB" },
                    { value: "512", label: "512 MB" },
                    { value: "1024", label: "1024 MB" },
                    { value: "2048", label: "2048 MB" },
                  ]}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <ModernSwitch
                  label="Criação de Empresas/Usuários"
                  value={userCreation}
                  onChange={handleChangeUserCreation}
                  loading={loadingUserCreation}
                  icon={<SettingsIcon sx={{ fontSize: 20 }} />}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>
      )}

      <Accordion className={classes.accordionSection}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          className={classes.accordionSummary}
        >
          <TuneIcon sx={{ mr: 2 }} />
          <Typography variant="h6" fontWeight="bold">
            Configurações Avançadas
          </Typography>
        </AccordionSummary>
        <AccordionDetails className={classes.accordionDetails}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Aceitar Chamadas WhatsApp"
                value={AcceptCallWhatsapp}
                onChange={handleAcceptCallWhatsapp}
                loading={loadingAcceptCallWhatsapp}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Permitir Remover Assinatura"
                value={sendSignMessage}
                onChange={handleSendSignMessage}
                loading={loadingSendSignMessage}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Saudação Uma Fila"
                value={sendGreetingMessageOneQueues}
                onChange={handleSendGreetingMessageOneQueues}
                loading={loadingSendGreetingMessageOneQueues}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Posição na Fila"
                value={sendQueuePosition}
                onChange={handleSendQueuePosition}
                loading={loadingSendQueuePosition}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Mensagem de Despedida"
                value={sendFarewellWaitingTicket}
                onChange={handleSendFarewellWaitingTicket}
                loading={loadingSendFarewellWaitingTicket}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Aceitar Áudio de Contatos"
                value={acceptAudioMessageContact}
                onChange={handleAcceptAudioMessageContact}
                loading={loadingAcceptAudioMessageContact}
                icon={<MessageIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Tag Obrigatória"
                value={requiredTag}
                onChange={handleRequiredTag}
                loading={loadingRequiredTag}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Fechar Ticket ao Transferir"
                value={closeTicketOnTransfer}
                onChange={handleCloseTicketOnTransfer}
                loading={loadingCloseTicketOnTransfer}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <ModernSwitch
                label="Direcionar para Carteiras"
                value={directTicketsToWallets}
                onChange={handleDirectTicketsToWallets}
                loading={loadingDirectTicketsToWallets}
                icon={<SettingsIcon sx={{ fontSize: 20 }} />}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Card className={classes.sectionCard}>
        <Box className={classes.sectionContent}>
          <Box display="flex" justifyContent="center" gap={2} flexWrap="wrap">
            <Chip
              label={`LGPD: ${enableLGPD === "enabled" ? "Ativo" : "Inativo"}`}
              color={enableLGPD === "enabled" ? "success" : "default"}
              variant="outlined"
            />
            <Chip
              label={`Avaliações: ${
                userRating === "enabled" ? "Ativo" : "Inativo"
              }`}
              color={userRating === "enabled" ? "success" : "default"}
              variant="outlined"
            />
            <Chip
              label={`Bot: ${
                chatBotType === "text"
                  ? "Texto"
                  : chatBotType === "list"
                  ? "Lista"
                  : "Botões"
              }`}
              color="primary"
              variant="outlined"
            />
            <Chip
              label={`Download: ${downloadLimit}MB`}
              color="info"
              variant="outlined"
            />
            <Chip
              label={`Notificações: ${
                showNotificationPending === "enabled" ? "Ativo" : "Inativo"
              }`}
              color={
                showNotificationPending === "enabled" ? "success" : "default"
              }
              variant="outlined"
            />
            <Chip
              label={`Agendamento: ${
                scheduleType === "disabled"
                  ? "Desabilitado"
                  : scheduleType === "queue"
                  ? "Por Fila"
                  : scheduleType === "company"
                  ? "Por Empresa"
                  : "Por Conexão"
              }`}
              color={scheduleType !== "disabled" ? "info" : "default"}
              variant="outlined"
            />
            <Chip
              label={`Operador: ${
                UserRandom === "enabled" ? "Aleatório" : "Sequencial"
              }`}
              color={UserRandom === "enabled" ? "warning" : "default"}
              variant="outlined"
            />
            <Chip
              label={`Audio: ${
                acceptAudioMessageContact === "enabled"
                  ? "Permitido"
                  : "Bloqueado"
              }`}
              color={
                acceptAudioMessageContact === "enabled" ? "success" : "error"
              }
              variant="outlined"
            />
          </Box>
        </Box>
      </Card>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode === "dark" ? "dark" : "light"}
      />
    </Container>
  );
}
