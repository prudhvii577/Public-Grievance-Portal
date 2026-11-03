import React, { useState, useEffect } from 'react';
import DashboardLayout from '../layouts/DashboardLayout';
import { complaintAPI } from '../services/api';

const ReportsAnalyticsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await complaintAPI.getReportsAnalytics();
      setReportData(res.data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = () => {
    if (!reportData || !reportData.department_performance) return;

    let csv = "Department,Code,Total Assigned,Resolved,Pending,In Progress,Resolution Rate (%)\n";
    reportData.department_performance.forEach((d) => {
      csv += `"${d.department_name}","${d.department_code}",${d.total_assigned},${d.resolved},${d.pending},${d.in_progress},${d.resolution_rate}%\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `PGRP_Civic_Grievance_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <DashboardLayout
      title="Municipal Grievance Reports & Performance Analytics"
      subtitle="Auditable civic resolution metrics, SLA turnaround, department scorecard & official reporting."
      actions={
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn btn-secondary btn-sm">
            📥 Export CSV Report
          </button>
          <button onClick={handlePrint} className="btn btn-primary btn-sm">
            🖨️ Print Report / PDF
          </button>
        </div>
      }
    >
      {loading || !reportData ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#64748b' }}>
          Compiling municipal analytics data...
        </div>
      ) : (
        <>
          {/* Executive Overview Banner */}
          <div className="card" style={{ marginBottom: '1.75rem', background: 'linear-gradient(135deg, #0f3e6d 0%, #1a56db 100%)', color: '#fff' }}>
            <div className="flex items-center justify-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.15)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <span className="badge" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#fff', marginBottom: '4px' }}>
                  EXECUTIVE SUMMARY
                </span>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Public Grievance Redressal Audit</h2>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                  Report Generated On: {new Date(reportData.generated_at).toLocaleString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#38bdf8' }}>
                  {reportData.summary.overall_resolution_rate}%
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Overall City Resolution Efficiency</div>
              </div>
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.65rem', fontWeight: 800 }}>{reportData.summary.total_complaints}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Total Complaints Filed</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#4ade80' }}>{reportData.summary.resolved_complaints}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Complaints Resolved</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#fde047' }}>{reportData.summary.pending_complaints}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Pending / In Triage</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.08)', padding: '0.85rem', borderRadius: '8px' }}>
                <div style={{ fontSize: '1.65rem', fontWeight: 800, color: '#7dd3fc' }}>{reportData.summary.in_progress_complaints}</div>
                <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Under Field Action</div>
              </div>
            </div>
          </div>

          {/* Department Performance Scorecard */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Department Performance Scorecard
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Departmental breakdown of grievance volume, active workloads, and resolution rates.
            </p>

            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Department Name</th>
                    <th>Code</th>
                    <th>Total Assigned</th>
                    <th>Resolved</th>
                    <th>In Progress</th>
                    <th>Pending</th>
                    <th style={{ width: '180px' }}>Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.department_performance.map((d) => (
                    <tr key={d.department_id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{d.department_name}</td>
                      <td>
                        <span className="badge" style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                          {d.department_code}
                        </span>
                      </td>
                      <td style={{ fontWeight: 700 }}>{d.total_assigned}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{d.resolved}</td>
                      <td style={{ color: '#0284c7' }}>{d.in_progress}</td>
                      <td style={{ color: '#d97706' }}>{d.pending}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${d.resolution_rate}%`,
                                height: '100%',
                                background: d.resolution_rate >= 75 ? '#10b981' : d.resolution_rate >= 50 ? '#f59e0b' : '#ef4444',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 700, minWidth: '42px' }}>
                            {d.resolution_rate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Distribution Analysis */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Category Volume Distribution
            </h3>
            <p style={{ fontSize: '0.825rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Incidence and resolution statistics across civic categories.
            </p>

            <div className="table-responsive">
              <table className="portal-table">
                <thead>
                  <tr>
                    <th>Category Name</th>
                    <th>Total Submissions</th>
                    <th>Resolved</th>
                    <th>Proportion of Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.category_distribution.map((cat) => (
                    <tr key={cat.category_id}>
                      <td style={{ fontWeight: 600, color: '#0f172a' }}>{cat.category_name}</td>
                      <td style={{ fontWeight: 700 }}>{cat.total_complaints}</td>
                      <td style={{ color: '#059669', fontWeight: 700 }}>{cat.resolved}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div style={{ flex: 1, maxWidth: '240px', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${cat.percentage}%`,
                                height: '100%',
                                background: '#1a56db',
                                borderRadius: '4px'
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{cat.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default ReportsAnalyticsPage;
