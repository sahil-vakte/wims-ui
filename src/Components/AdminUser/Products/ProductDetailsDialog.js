import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import ProductImportReporting from "./ProductImportReporting";
import ApiServices from "../../../Services/ApiServices/ApiServices";
import { getDecryptedAccessToken } from "../../../Services/LoginUserDetails.js/LoginUserSavedDetails";

const theme = {
  accent: "#6366f1",
  accentSoft: "rgba(99,102,241,0.10)",
  bg: "#f8fafc",
  card: "#ffffff",
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  success: "#16a34a",
  successSoft: "rgba(34,197,94,0.10)",
  danger: "#dc2626",
  dangerSoft: "rgba(239,68,68,0.10)",
  warn: "#d97706",
  warnSoft: "rgba(245,158,11,0.10)",
};

const formatValue = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
};

const getStatusStyle = (status) => {
  const value = (status || "").toLowerCase();

  if (value.includes("inactive")) {
    return { color: theme.muted, bg: "rgba(100,116,139,0.12)" };
  }

  if (value.includes("out")) {
    return { color: theme.danger, bg: theme.dangerSoft };
  }

  if (value.includes("low")) {
    return { color: theme.warn, bg: theme.warnSoft };
  }

  return { color: theme.success, bg: theme.successSoft };
};

const splitImages = (value) => {
  if (!value) return [];
  return String(value)
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
};

const splitTags = (value) => {
  if (!value) return [];
  return String(value)
    .split(/\n|,/)
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const getLocationName = (location) => {
  if (!location) return "—";

  if (typeof location === "object") {
    return (
      location.name ||
      location.display_name ||
      location.location_name ||
      location.code ||
      location.id ||
      "—"
    );
  }

  return location;
};

const DetailItem = ({ label, value }) => (
  <Box
    sx={{
      p: 1.5,
      borderRadius: "12px",
      background: theme.bg,
      border: `1px solid ${theme.border}`,
      minHeight: 72,
    }}
  >
    <Typography
      sx={{
        fontSize: 11,
        color: theme.muted,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        mb: 0.7,
      }}
    >
      {label}
    </Typography>

    <Typography
      sx={{
        fontSize: 14,
        color: theme.text,
        fontWeight: 600,
        wordBreak: "break-word",
      }}
    >
      {formatValue(value)}
    </Typography>
  </Box>
);

const Section = ({ title, children }) => (
  <Box
    sx={{
      p: 2.5,
      borderRadius: "16px",
      background: theme.card,
      border: `1px solid ${theme.border}`,
    }}
  >
    <Typography sx={{ fontWeight: 800, color: theme.text, fontSize: 15, mb: 1.5 }}>
      {title}
    </Typography>

    {children}
  </Box>
);

const Grid = ({ children }) => (
  <Box
    sx={{
      display: "grid",
      gridTemplateColumns: {
        xs: "1fr",
        sm: "repeat(2, 1fr)",
        md: "repeat(3, 1fr)",
      },
      gap: 1.5,
    }}
  >
    {children}
  </Box>
);

const ProductDetailsDialog = ({ open, sku, onClose }) => {
  const accessToken = useMemo(() => getDecryptedAccessToken(), []);

  const headers = useMemo(
    () => (accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    [accessToken]
  );

  const [loading, setLoading] = useState(false);
  const [productStock, setProductStock] = useState(null);
  const [error, setError] = useState("");

  const fetchProductDetails = async () => {
    if (!sku) return;

    setLoading(true);
    setError("");
    setProductStock(null);

    try {
      let response;

      try {
        response = await ApiServices.get(
          `stock/${encodeURIComponent(sku)}/`,
          headers
        );
      } catch {
        const params = new URLSearchParams();
        params.set("search", sku);
        params.set("page_size", 25);

        response = await ApiServices.get(`stock/?${params.toString()}`, headers);
      }

      const data = response?.data ?? response;

      if (data?.results) {
        const exactItem =
          data.results.find((item) => item.sku === sku) || data.results[0];

        setProductStock(exactItem || null);
      } else {
        setProductStock(data || null);
      }
    } catch (err) {
      console.error("Failed to fetch product details", err);
      setError("Unable to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && sku) {
      fetchProductDetails();
    }
  }, [open, sku]);

  const product = productStock?.product || {};
  const color = productStock?.color || {};
  const status = getStatusStyle(productStock?.stock_status);

  const title =
    product?.child_product_title ||
    product?.parent_product_title ||
    productStock?.product_type ||
    productStock?.sku ||
    "Product Details";

  const images = splitImages(
    productStock?.parent_product_images ||
      product?.parent_product_images ||
      product?.child_product_images
  );

  const categories = product?.categories || [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "18px",
          maxHeight: "92vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          px: 3,
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 20, color: theme.text }}>
            Product Details
          </Typography>

          <Typography sx={{ color: theme.muted, fontSize: 13, mt: 0.3 }}>
            SKU: {sku || "—"}
          </Typography>
        </Box>

        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ background: theme.bg, p: 3 }}>
        {loading && (
          <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }} spacing={2}>
            <CircularProgress sx={{ color: theme.accent }} />
            <Typography sx={{ color: theme.muted }}>Loading product details...</Typography>
          </Stack>
        )}

        {!loading && error && (
          <Box
            sx={{
              p: 3,
              borderRadius: "14px",
              background: theme.dangerSoft,
              border: `1px solid ${theme.danger}`,
            }}
          >
            <Typography sx={{ color: theme.danger, fontWeight: 700 }}>
              {error}
            </Typography>
          </Box>
        )}

        {!loading && !error && productStock && (
          <Stack spacing={2.5}>
            <Section title="Overview">
              <Stack direction={{ xs: "column", md: "row" }} spacing={2.5}>
                <Avatar
                  variant="rounded"
                  src={images[0] || ""}
                  sx={{
                    width: 130,
                    height: 130,
                    bgcolor: theme.accentSoft,
                    color: theme.accent,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  <Inventory2Icon sx={{ fontSize: 48 }} />
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      color: theme.text,
                      fontSize: { xs: 20, md: 24 },
                      lineHeight: 1.25,
                    }}
                  >
                    {title}
                  </Typography>

                  <Typography sx={{ color: theme.muted, fontSize: 14, mt: 0.8 }}>
                    Subtitle: {formatValue(product?.product_subtitle)}
                  </Typography>

                  <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap sx={{ mt: 1.5 }}>
                    <Chip
                      label={productStock?.stock_status || "—"}
                      size="small"
                      sx={{
                        background: status.bg,
                        color: status.color,
                        fontWeight: 700,
                      }}
                    />

                    <Chip
                      label={productStock?.is_active ? "Active" : "Inactive"}
                      size="small"
                      sx={{
                        background: productStock?.is_active
                          ? theme.successSoft
                          : "rgba(100,116,139,0.12)",
                        color: productStock?.is_active ? theme.success : theme.muted,
                        fontWeight: 700,
                      }}
                    />

                    {color?.display_name && (
                      <Chip
                        label={color.display_name}
                        size="small"
                        sx={{
                          background: theme.accentSoft,
                          color: theme.accent,
                          fontWeight: 700,
                        }}
                      />
                    )}

                    {product?.parent_product_sash && (
                      <Chip
                        label={product.parent_product_sash}
                        size="small"
                        sx={{
                          background: theme.warnSoft,
                          color: theme.warn,
                          fontWeight: 700,
                        }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {images.length > 1 && (
                <Stack direction="row" spacing={1.2} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                  {images.map((img) => (
                    <Box
                      key={img}
                      component="img"
                      src={img}
                      alt="Product"
                      sx={{
                        width: 92,
                        height: 92,
                        objectFit: "cover",
                        borderRadius: "12px",
                        border: `1px solid ${theme.border}`,
                        background: theme.bg,
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Section>

            <Section title="Stock Information">
              <Grid>
                <DetailItem label="Available Stock In MTR" value={`${productStock?.available_stock_in_mtr ?? 0} mtr`} />
                <DetailItem label="Total Available Stock" value={`${productStock?.total_available_stock ?? 0} mtr`} />
                <DetailItem label="Reserved Stock" value={productStock?.reserved_stock ?? 0} />
                <DetailItem label="Minimum Stock Level" value={productStock?.minimum_stock_level} />
                <DetailItem label="Maximum Stock Level" value={productStock?.maximum_stock_level} />
                <DetailItem label="Stock Value" value={productStock?.stock_value} />
                <DetailItem label="Low Stock" value={productStock?.is_low_stock} />
                <DetailItem label="Discontinued" value={productStock?.is_discontinued} />
                <DetailItem label="Last Stock Update" value={productStock?.last_stock_update} />
              </Grid>
            </Section>

            <Section title="Product Information">
              <Grid>
                <DetailItem label="SKU" value={productStock?.sku} />
                <DetailItem label="Product Type" value={productStock?.product_type} />
                <DetailItem label="VS Child ID" value={product?.vs_child_id} />
                <DetailItem label="VS Parent ID" value={product?.vs_parent_id} />
                <DetailItem label="Parent Reference" value={product?.parent_reference} />
                <DetailItem label="Child Reference" value={product?.child_reference} />
                <DetailItem label="Available On Website" value={product?.available_on_this_website} />
                <DetailItem label="Available Now" value={product?.available_now} />
                <DetailItem label="Featured" value={product?.featured} />
                <DetailItem label="Trade Only" value={product?.trade_only_product} />
                <DetailItem label="Allow Sample Request" value={product?.allow_sample_request} />
                <DetailItem label="Sample Request Cost" value={product?.sample_request_cost} />
              </Grid>
            </Section>

            <Section title="Pricing">
              <Grid>
                <DetailItem label="Effective Price" value={`£${product?.effective_price ?? 0}`} />
                <DetailItem label="Price Break 1 Quantity" value={product?.price_break_1_quantity} />
                <DetailItem label="Price Break 1 Price" value={product?.price_break_1_price} />
                <DetailItem label="Price Break 1 Sale Price" value={product?.price_break_1_sale_price} />
                <DetailItem label="VAT Rate" value={product?.vat_rate} />
                <DetailItem label="Unit Cost" value={productStock?.unit_cost} />
                <DetailItem label="Last Purchase Price" value={productStock?.last_purchase_price} />
                <DetailItem label="Deposit Price Inc VAT" value={product?.deposit_price_inc_vat} />
                <DetailItem label="RRP Price Inc VAT" value={product?.rrp_price_inc_vat} />
              </Grid>
            </Section>

            <Section title="Color & Location">
              <Grid>
                <DetailItem label="Color Name" value={color?.color_name} />
                <DetailItem label="Color Code" value={color?.color_code} />
                <DetailItem label="Display Name" value={color?.display_name} />
                <DetailItem label="Primary Location" value={getLocationName(productStock?.primary_location)} />
                <DetailItem label="Secondary Location" value={getLocationName(productStock?.secondary_location)} />
                <DetailItem label="Warehouse Location" value={productStock?.warehouse_location} />
                <DetailItem label="Pick Location" value={product?.pick_location} />
                <DetailItem label="Supplier" value={productStock?.supplier} />
                <DetailItem label="Lead Time Days" value={productStock?.lead_time_days} />
              </Grid>
            </Section>

            {!!categories.length && (
              <Section title="Categories">
                <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                  {categories.map((cat) => (
                    <Chip
                      key={cat.id}
                      label={cat.name}
                      size="small"
                      sx={{
                        background: theme.accentSoft,
                        color: theme.accent,
                        fontWeight: 700,
                      }}
                    />
                  ))}
                </Stack>
              </Section>
            )}

            <Section title="Tags">
              <Stack direction="row" flexWrap="wrap" spacing={1} useFlexGap>
                {[
                  ...splitTags(product?.tag_colours),
                  ...splitTags(product?.tag_material),
                  ...splitTags(product?.tag_print_texture),
                  ...splitTags(product?.tag_matching_lycra_mesh),
                ].map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    sx={{
                      background: theme.bg,
                      color: theme.text,
                      border: `1px solid ${theme.border}`,
                      fontWeight: 600,
                    }}
                  />
                ))}

                {!product?.tag_colours &&
                  !product?.tag_material &&
                  !product?.tag_print_texture &&
                  !product?.tag_matching_lycra_mesh && (
                    <Typography sx={{ color: theme.muted }}>No tags available.</Typography>
                  )}
              </Stack>
            </Section>

            {product?.product_summary && (
              <Section title="Product Summary">
                <Box
                  sx={{
                    color: theme.text,
                    fontSize: 14,
                    lineHeight: 1.7,
                    "& p": { marginTop: 0 },
                  }}
                  dangerouslySetInnerHTML={{ __html: product.product_summary }}
                />
              </Section>
            )}

            <Section title="SEO">
              <Grid>
                <DetailItem label="Meta Title" value={product?.meta_title} />
                <DetailItem label="Meta Keywords" value={product?.meta_keywords} />
                <DetailItem label="Meta Description" value={product?.meta_description} />
                <DetailItem label="Parent Product URL" value={product?.parent_product_url} />
                <DetailItem label="Child Product URL" value={product?.child_product_url} />
              </Grid>
            </Section>

            <Section title="Dates">
              <Grid>
                <DetailItem label="Product Created At" value={product?.created_at} />
                <DetailItem label="Product Updated At" value={product?.updated_at} />
                <DetailItem label="Stock Created At" value={productStock?.created_at} />
                <DetailItem label="Stock Updated At" value={productStock?.updated_at} />
                <DetailItem label="Release Date" value={product?.release_date} />
                <DetailItem label="Date Added" value={product?.date_added} />
              </Grid>
            </Section>

            <ProductImportReporting sku={sku}/>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailsDialog;