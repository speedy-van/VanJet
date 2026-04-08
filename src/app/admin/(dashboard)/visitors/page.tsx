"use client";

// ─── VanJet · Admin Visitors Analytics Page ───────────────────
// Real-time visitor statistics with charts

import { useState, useEffect, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import {
  Box,
  Flex,
  Text,
  Grid,
  Badge,
  Spinner,
  Table,
  NativeSelect,
  Progress,
} from "@chakra-ui/react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { Users, UserPlus, Globe, RefreshCw, Monitor } from "lucide-react";
import { Button } from "@chakra-ui/react";

const COLORS = ["#3182CE", "#38A169", "#DD6B20", "#805AD5", "#D53F8C", "#00B5D8"];

interface VisitorStats {
  total: number;
  new: number;
  returning: number;
  byCountry: Array<{ country: string | null; count: number }>;
  byDevice: Array<{ device: string | null; count: number }>;
  byBrowser: Array<{ browser: string | null; count: number }>;
  dailyTrend: Array<{ date: string; count: number }>;
}

interface PageViewStats {
  total: number;
  topPages: Array<{ page: string | null; count: number }>;
}

interface Visitor {
  id: string;
  fingerprint: string;
  country?: string | null;
  city?: string | null;
  browser?: string | null;
  os?: string | null;
  deviceType?: string | null;
  visitCount: number;
  lastSeenAt: string;
}

export default function AdminVisitorsPage() {
  const t = useTranslations("admin.visitors");

  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState("30");
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [pageViews, setPageViews] = useState<PageViewStats | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/visitors?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch");
      
      const data = await res.json();
      setStats(data.stats);
      setPageViews(data.pageViews);
      setRecentVisitors(data.recent?.visitors || []);
    } catch (error) {
      console.error("[Visitors] Fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchData();
    // Auto-poll every 30 seconds
    const interval = setInterval(fetchData, 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
  };

  return (
    <Box>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <Box>
          <Text fontSize="xl" fontWeight="700" color="gray.800">
            {t("title")}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {t("subtitle")}
          </Text>
        </Box>

        <Flex gap={3}>
          <NativeSelect.Root size="sm" width="160px">
            <NativeSelect.Field
              value={days}
              onChange={(e) => setDays(e.target.value)}
            >
              <option value="7">{t("last7Days")}</option>
              <option value="30">{t("last30Days")}</option>
              <option value="90">{t("last90Days")}</option>
            </NativeSelect.Field>
          </NativeSelect.Root>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchData}
            loading={loading}
          >
            <RefreshCw size={16} />
          </Button>
        </Flex>
      </Flex>

      {loading ? (
        <Flex justify="center" py={12}>
          <Spinner size="lg" />
        </Flex>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={4} mb={6}>
            <StatCard
              icon={<Users size={24} />}
              label={t("totalVisitors")}
              value={stats?.total || 0}
              color="blue"
            />
            <StatCard
              icon={<UserPlus size={24} />}
              label={t("newVisitors")}
              value={stats?.new || 0}
              color="green"
            />
            <StatCard
              icon={<Users size={24} />}
              label={t("returningVisitors")}
              value={stats?.returning || 0}
              color="orange"
            />
            <StatCard
              icon={<Globe size={24} />}
              label={t("pageViews")}
              value={pageViews?.total || 0}
              color="purple"
            />
          </Grid>

          {/* Device Breakdown Progress Bars */}
          {stats?.byDevice && stats.byDevice.length > 0 && (
            <Box bg="white" p={4} borderRadius="lg" borderWidth="1px" mb={6}>
              <Flex align="center" gap={2} mb={4}>
                <Monitor size={18} />
                <Text fontWeight="600">{t("byDevice")}</Text>
              </Flex>
              {(() => {
                const total = stats.byDevice.reduce((acc, d) => acc + d.count, 0) || 1;
                const deviceColors: Record<string, string> = {
                  desktop: "blue",
                  mobile: "green",
                  tablet: "orange",
                };
                return stats.byDevice.map((d, idx) => {
                  const pct = Math.round((d.count / total) * 100);
                  const color = deviceColors[d.device || "desktop"] || COLORS[idx % COLORS.length];
                  return (
                    <Box key={idx} mb={3}>
                      <Flex justify="space-between" mb={1}>
                        <Text fontSize="sm" textTransform="capitalize">
                          {d.device || "desktop"}
                        </Text>
                        <Text fontSize="sm" color="gray.500">
                          {d.count} ({pct}%)
                        </Text>
                      </Flex>
                      <Progress.Root
                        value={pct}
                        size="sm"
                        colorPalette={typeof color === "string" && !color.startsWith("#") ? color : "blue"}
                      >
                        <Progress.Track>
                          <Progress.Range />
                        </Progress.Track>
                      </Progress.Root>
                    </Box>
                  );
                });
              })()}
            </Box>
          )}

          {/* Charts Row */}
          <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6} mb={6}>
            {/* Daily Trend */}
            <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="600" mb={4}>
                {t("dailyTrend")}
              </Text>
              <Box h="250px">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.dailyTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      fontSize={12}
                    />
                    <YAxis fontSize={12} />
                    <Tooltip
                      labelFormatter={(label) => formatDate(String(label))}
                    />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#3182CE"
                      fill="#3182CE"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Device Distribution */}
            <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="600" mb={4}>
                {t("byDevice")}
              </Text>
              <Box h="250px">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.byDevice || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={40}
                      dataKey="count"
                      nameKey="device"
                      label={({ payload, percent }) =>
                        `${payload?.device || "desktop"} (${((percent || 0) * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {(stats?.byDevice || []).map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={COLORS[idx % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Second Charts Row */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6} mb={6}>
            {/* Top Countries */}
            <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="600" mb={4}>
                {t("topCountries")}
              </Text>
              <Box h="250px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(stats?.byCountry || []).slice(0, 5)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="country"
                      width={100}
                      fontSize={12}
                      tickFormatter={(v) => v || "Unknown"}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3182CE" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>

            {/* Top Browsers */}
            <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="600" mb={4}>
                {t("topBrowsers")}
              </Text>
              <Box h="250px">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(stats?.byBrowser || []).slice(0, 5)}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="browser"
                      width={80}
                      fontSize={12}
                    />
                    <Tooltip />
                    <Bar dataKey="count" fill="#38A169" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </Grid>

          {/* Top Pages */}
          <Box bg="white" p={4} borderRadius="lg" borderWidth="1px" mb={6}>
            <Text fontWeight="600" mb={4}>
              {t("topPages")}
            </Text>
            <Table.Root size="sm">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>{t("page")}</Table.ColumnHeader>
                  <Table.ColumnHeader textAlign="end">{t("views")}</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {(pageViews?.topPages || []).map((p, idx) => (
                  <Table.Row key={idx}>
                    <Table.Cell fontFamily="mono" fontSize="sm">
                      {p.page || "/"}
                    </Table.Cell>
                    <Table.Cell textAlign="end">
                      <Badge colorPalette="blue">{p.count}</Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
                {(pageViews?.topPages || []).length === 0 && (
                  <Table.Row>
                    <Table.Cell colSpan={2} textAlign="center" color="gray.500">
                      {t("noData")}
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Root>
          </Box>

          {/* Recent Visitors */}
          <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
            <Text fontWeight="600" mb={4}>
              {t("recentVisitors")}
            </Text>
            <Box overflowX="auto">
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>{t("location")}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t("device")}</Table.ColumnHeader>
                    <Table.ColumnHeader>{t("browser")}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">{t("visits")}</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="end">{t("lastVisit")}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {recentVisitors.slice(0, 10).map((visitor) => (
                    <Table.Row key={visitor.id}>
                      <Table.Cell>
                        <Flex align="center" gap={2}>
                          <Globe size={14} />
                          <Text>
                            {visitor.city && visitor.country
                              ? `${visitor.city}, ${visitor.country}`
                              : visitor.country || "Unknown"}
                          </Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text textTransform="capitalize">
                          {visitor.deviceType || "desktop"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        {visitor.browser} / {visitor.os}
                      </Table.Cell>
                      <Table.Cell textAlign="center">
                        <Badge
                          colorPalette={visitor.visitCount > 1 ? "green" : "gray"}
                        >
                          {visitor.visitCount}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell textAlign="end" fontSize="sm" color="gray.600">
                        {new Date(visitor.lastSeenAt).toLocaleString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                  {recentVisitors.length === 0 && (
                    <Table.Row>
                      <Table.Cell colSpan={5} textAlign="center" color="gray.500">
                        {t("noData")}
                      </Table.Cell>
                    </Table.Row>
                  )}
                </Table.Body>
              </Table.Root>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  const [displayed, setDisplayed] = useState(0);
  const prevValue = useRef(0);
  const frameRef = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const diff = value - from;
    if (diff === 0) return;
    const start = performance.now();
    const duration = 800;

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(from + diff * eased));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        prevValue.current = value;
      }
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [value]);

  return (
    <Box bg="white" p={4} borderRadius="lg" borderWidth="1px">
      <Flex align="center" gap={3}>
        <Flex
          align="center"
          justify="center"
          w={12}
          h={12}
          borderRadius="lg"
          bg={`${color}.50`}
          color={`${color}.500`}
        >
          {icon}
        </Flex>
        <Box>
          <Text fontSize="2xl" fontWeight="700" lineHeight="1">
            {displayed.toLocaleString()}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {label}
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}
