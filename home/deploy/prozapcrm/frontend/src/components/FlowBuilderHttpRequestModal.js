import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Divider,
  useTheme, // Added import for useTheme
} from "@mui/material";
import { Delete, FileCopy } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useNodeStorage } from "../stores/useNodeStorage"; // Correct path as previously fixed

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

const FlowBuilderHttpRequestModal = ({
  open,
  onSave,
  onUpdate,
  data,
  close,
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { setNodesStorage, setAct } = useNodeStorage();

  const [formData, setFormData] = useState({
    url: "",
    method: "GET",
    label: "",
  });

  useEffect(() => {
    if (data && open === "edit") {
      setFormData({
        url: data.url || "",
        method: data.method || "GET",
        label: data.label || "",
        id: data.id || null,
      });
    } else {
      setFormData({
        url: "",
        method: "GET",
        label: "",
      });
    }
  }, [data, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    if (!formData.url || !formData.method) {
      toast.error("URL e método são obrigatórios!");
      return;
    }

    if (open === "edit" && data) {
      onUpdate({ ...data, ...formData });
    } else {
      onSave(formData);
    }
    handleClose();
  };

  const handleDelete = () => {
    if (data && data.id) {
      setNodesStorage(data.id);
      setAct("delete");
      toast.success("Nó excluído com sucesso!");
      handleClose();
    }
  };

  const handleDuplicate = () => {
    if (data && data.id) {
      setNodesStorage(data.id);
      setAct("duplicate");
      toast.success("Nó duplicado com sucesso!");
      handleClose();
    }
  };

  const handleClose = () => {
    close(null);
    setFormData({
      url: "",
      method: "GET",
      label: "",
    });
  };

  const modernStyles = {
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

  return (
    <Dialog
      open={!!open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          ...modernStyles.glassmorphism,
          borderRadius: "20px",
          overflow: "hidden",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          color: "white",
          fontWeight: 600,
          py: 2,
          textAlign: "center",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {open === "edit" ? "Editar HTTP Request" : "Adicionar HTTP Request"}
        {open === "edit" && (
          <Box>
            <IconButton
              onClick={handleDuplicate}
              sx={{
                color: "white",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
              title="Duplicar"
            >
              <FileCopy />
            </IconButton>
            <IconButton
              onClick={handleDelete}
              sx={{
                color: "white",
                "&:hover": {
                  background: "rgba(255, 255, 255, 0.1)",
                },
              }}
              title="Excluir"
            >
              <Delete />
            </IconButton>
          </Box>
        )}
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, mt: 2 }}>
          <TextField
            label="URL"
            name="url"
            value={formData.url}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            required
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDark
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
          <FormControl fullWidth variant="outlined" required>
            <InputLabel
              sx={{
                color: isDark
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              }}
            >
              Método
            </InputLabel>
            <Select
              name="method"
              value={formData.method}
              onChange={handleChange}
              sx={{
                borderRadius: "12px",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#3b82f6",
                },
              }}
            >
              {httpMethods.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Label"
            name="label"
            value={formData.label}
            onChange={handleChange}
            fullWidth
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: "12px",
                "& fieldset": {
                  borderColor: isDark
                    ? "rgba(255, 255, 255, 0.2)"
                    : "rgba(0, 0, 0, 0.2)",
                },
                "&:hover fieldset": {
                  borderColor: "#3b82f6",
                },
              },
              "& .MuiInputLabel-root": {
                color: isDark
                  ? "rgba(255, 255, 255, 0.7)"
                  : "rgba(0, 0, 0, 0.6)",
              },
            }}
          />
          <Divider
            sx={{
              my: 2,
              borderColor: isDark
                ? "rgba(255, 255, 255, 0.2)"
                : "rgba(0, 0, 0, 0.2)",
            }}
          />
          <Card sx={{ ...modernStyles.glassmorphism, borderRadius: "12px" }}>
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: isDark
                    ? "rgba(255, 255, 255, 0.9)"
                    : "rgba(0, 0, 0, 0.8)",
                  mb: 2,
                }}
              >
                Preview
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Typography
                  sx={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  <strong>Método:</strong> {formData.method || "Não definido"}
                </Typography>
                <Typography
                  sx={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                    wordBreak: "break-all",
                  }}
                >
                  <strong>URL:</strong> {formData.url || "Não definida"}
                </Typography>
                <Typography
                  sx={{
                    color: isDark
                      ? "rgba(255, 255, 255, 0.7)"
                      : "rgba(0, 0, 0, 0.6)",
                  }}
                >
                  <strong>Label:</strong> {formData.label || "Não definido"}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, justifyContent: "space-between" }}>
        <Button
          onClick={handleClose}
          sx={{
            color: "#4a5568",
            textTransform: "none",
            borderRadius: "12px",
            px: 3,
            py: 1,
            "&:hover": {
              background: isDark
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0, 0, 0, 0.1)",
            },
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            color: "white",
            fontWeight: 600,
            borderRadius: "12px",
            px: 3,
            py: 1,
            textTransform: "none",
            boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 12px 35px rgba(102, 126, 234, 0.6)",
              background: `linear-gradient(135deg, #764ba2 0%, #667eea 100%)`,
            },
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {open === "edit" ? "Atualizar" : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FlowBuilderHttpRequestModal;
