import { tokens } from '../styles/theme';
import type { Node } from '@xyflow/react';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'number' | 'checkbox';
  options?: string[];
  placeholder?: string;
  defaultValue?: string | number | boolean;
}

const NODE_CONFIG_FIELDS: Record<string, FieldDef[]> = {
  '起始URL': [
    { key: 'urls', label: 'URL列表 (每行一个)', type: 'textarea', placeholder: 'https://example.com\nhttps://example.com/page2' },
  ],
  'HTTP请求': [
    { key: 'url', label: '请求URL (支持 {变量})', type: 'text', placeholder: 'https://example.com/{path}' },
    { key: 'method', label: '请求方法', type: 'select', options: ['GET', 'POST', 'PUT', 'DELETE'], defaultValue: 'GET' },
    { key: 'headers', label: '请求头 (JSON)', type: 'textarea', placeholder: '{"User-Agent": "Mozilla/5.0"}' },
    { key: 'body', label: '请求体 (JSON)', type: 'textarea', placeholder: '{"key": "value"}' },
    { key: 'timeout', label: '超时(秒)', type: 'number', defaultValue: 30 },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'response' },
  ],
  'API请求': [
    { key: 'url', label: '接口URL', type: 'text', placeholder: 'https://api.example.com/data' },
    { key: 'method', label: '请求方法', type: 'select', options: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], defaultValue: 'GET' },
    { key: 'auth_type', label: '认证类型', type: 'select', options: ['none', 'bearer', 'basic'], defaultValue: 'none' },
    { key: 'auth_token', label: 'Token / 密码', type: 'text', placeholder: 'your-token-or-password' },
    { key: 'auth_username', label: '用户名 (Basic Auth)', type: 'text', placeholder: 'username' },
    { key: 'params', label: '查询参数 (JSON)', type: 'textarea', placeholder: '{"page": 1, "size": 20}' },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'api_response' },
  ],
  '浏览器执行': [
    { key: 'url', label: '目标URL', type: 'text', placeholder: 'https://example.com' },
    { key: 'wait_for', label: '等待选择器', type: 'text', placeholder: '.content, #main' },
    { key: 'screenshot', label: '截图', type: 'checkbox', defaultValue: false },
    { key: 'headless', label: '无头模式', type: 'checkbox', defaultValue: true },
    { key: 'timeout', label: '超时(秒)', type: 'number', defaultValue: 30 },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'browser_html' },
  ],
  '循环': [
    { key: 'source_type', label: '循环类型', type: 'select', options: ['url_list', 'pagination', 'array'], defaultValue: 'url_list' },
    { key: 'source_key', label: '数据源键', type: 'text', placeholder: '起始URL列表' },
    { key: 'page_param', label: '分页参数名', type: 'text', placeholder: 'page' },
    { key: 'page_start', label: '起始页', type: 'number', defaultValue: 1 },
    { key: 'page_end', label: '结束页', type: 'number', defaultValue: 10 },
    { key: 'item_key', label: '当前项变量名', type: 'text', placeholder: 'current_url' },
  ],
  '条件分支': [
    { key: 'source_key', label: '判断数据键', type: 'text', placeholder: 'response' },
    { key: 'operator', label: '运算符', type: 'select', options: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty', 'regex_match'], defaultValue: 'contains' },
    { key: 'value', label: '比较值', type: 'text', placeholder: 'expected_value' },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'condition_result' },
  ],
  'HTML解析': [
    { key: 'source_key', label: 'HTML数据键', type: 'text', placeholder: 'response' },
    { key: 'selectors', label: 'CSS选择器 (JSON)', type: 'textarea', placeholder: '{"title": "h1", "price": ".price"}' },
    { key: 'table_mode', label: '表格模式', type: 'checkbox', defaultValue: false },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'parsed_data' },
  ],
  'JSON解析': [
    { key: 'source_key', label: 'JSON数据键', type: 'text', placeholder: 'api_response' },
    { key: 'paths', label: 'JSONPath映射 (JSON)', type: 'textarea', placeholder: '{"items": "$.data.list", "total": "$.data.total"}' },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'json_data' },
  ],
  '正则清洗': [
    { key: 'source_key', label: '数据键', type: 'text', placeholder: 'parsed_data' },
    { key: 'rules', label: '清洗规则 (JSON数组)', type: 'textarea', placeholder: '[{"field": "price", "pattern": "[^\\\\d.]", "replace": ""}]' },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'cleaned_data' },
  ],
  '字段映射': [
    { key: 'source_key', label: '数据键', type: 'text', placeholder: 'parsed_data' },
    { key: 'mapping', label: '字段映射 (JSON)', type: 'textarea', placeholder: '{"old_name": "new_name", "price_str": "price"}' },
    { key: 'add_to_results', label: '追加到结果集', type: 'checkbox', defaultValue: false },
    { key: 'result_key', label: '结果存储键', type: 'text', placeholder: 'mapped_data' },
  ],
  '保存到文件': [
    { key: 'source_key', label: '数据键', type: 'text', placeholder: 'results' },
    { key: 'format', label: '文件格式', type: 'select', options: ['jsonl', 'json', 'csv'], defaultValue: 'jsonl' },
    { key: 'filename', label: '文件名 (可选)', type: 'text', placeholder: 'output' },
    { key: 'fields', label: '保留字段 (逗号分隔)', type: 'text', placeholder: 'title,price,url' },
  ],
  '人机验证': [
    { key: 'url', label: '验证页面URL', type: 'text', placeholder: 'https://example.com/verify' },
    { key: 'question_selector', label: '问题选择器', type: 'text', placeholder: '.question, #verify-question' },
    { key: 'input_selector', label: '输入框选择器', type: 'text', placeholder: 'input[name="answer"]' },
    { key: 'submit_selector', label: '提交按钮选择器', type: 'text', placeholder: 'button[type="submit"]' },
  ],
};

interface NodeConfigPanelProps {
  node: Node | null;
  onUpdate: (nodeId: string, data: Record<string, unknown>) => void;
  onClose: () => void;
}

const fieldStyle = {
  width: '100%' as const,
  fontSize: 12,
  padding: '7px 10px',
  border: `1px solid ${tokens.borderDefault}`,
  borderRadius: tokens.radiusMd,
  background: tokens.bgElevated,
  color: tokens.textPrimary,
  boxSizing: 'border-box' as const,
  transition: 'border-color 0.15s, box-shadow 0.15s',
  outline: 'none',
};

const labelStyle = {
  display: 'block' as const,
  fontSize: 11,
  fontWeight: 600,
  color: tokens.textSecondary,
  marginBottom: 6,
  letterSpacing: '0.02em',
};

export function NodeConfigPanel({ node, onUpdate, onClose }: NodeConfigPanelProps) {
  if (!node) return null;

  const colors = tokens.nodeColors[node.type as string];
  const fields = NODE_CONFIG_FIELDS[node.type as string] ?? [];
  const data = (node.data ?? {}) as Record<string, unknown>;

  return (
    <aside style={{
      width: 292,
      background: tokens.bgSurface,
      borderLeft: `1px solid ${tokens.borderDefault}`,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      flexShrink: 0,
      boxShadow: `-${tokens.shadowMd}`,
    }}>
      {/* Header */}
      <div style={{
        padding: `${tokens.sp2}px ${tokens.sp3}px`,
        borderBottom: `1px solid ${tokens.borderDefault}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: tokens.bgElevated,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: tokens.sp2 }}>
          {colors && (
            <div style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: colors.border,
              boxShadow: `0 0 0 3px ${colors.shadow}`,
              flexShrink: 0,
            }} />
          )}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: colors?.text ?? tokens.textPrimary }}>
              {node.type as string}
            </div>
            <div style={{ fontSize: 10, color: tokens.textMuted, marginTop: 1 }}>
              节点 #{node.id}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            width: 26,
            height: 26,
            borderRadius: tokens.radiusMd,
            border: `1px solid ${tokens.borderDefault}`,
            background: 'transparent',
            color: tokens.textSecondary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 16,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = tokens.bgHover;
            (e.currentTarget as HTMLButtonElement).style.color = tokens.textPrimary;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.color = tokens.textSecondary;
          }}
        >
          ×
        </button>
      </div>

      {/* Fields */}
      <div style={{ overflowY: 'auto', flex: 1, padding: tokens.sp3 }}>
        {fields.length === 0 ? (
          <div style={{
            color: tokens.textMuted,
            fontSize: 12,
            textAlign: 'center',
            marginTop: tokens.sp4,
          }}>
            此节点无可配置项
          </div>
        ) : (
          fields.map((field) => (
            <div key={field.key} style={{ marginBottom: tokens.sp3 }}>
              <label style={labelStyle}>{field.label}</label>

              {field.type === 'textarea' && (
                <textarea
                  value={(data[field.key] as string) ?? ''}
                  placeholder={field.placeholder}
                  rows={3}
                  onChange={(e) => onUpdate(node.id, { ...data, [field.key]: e.target.value })}
                  style={{ ...fieldStyle, resize: 'vertical', fontFamily: tokens.fontMono }}
                />
              )}

              {field.type === 'select' && (
                <select
                  value={(data[field.key] as string) ?? (field.defaultValue as string ?? '')}
                  onChange={(e) => onUpdate(node.id, { ...data, [field.key]: e.target.value })}
                  style={fieldStyle}
                >
                  {field.options?.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}

              {field.type === 'checkbox' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', paddingTop: 2 }}>
                  <div
                    onClick={() => {
                      const current = (data[field.key] as boolean) ?? (field.defaultValue as boolean ?? false);
                      onUpdate(node.id, { ...data, [field.key]: !current });
                    }}
                    style={{
                      width: 36,
                      height: 20,
                      borderRadius: 10,
                      background: ((data[field.key] as boolean) ?? (field.defaultValue as boolean)) ? tokens.accent : tokens.borderDefault,
                      border: `1px solid ${((data[field.key] as boolean) ?? (field.defaultValue as boolean)) ? tokens.accent : tokens.borderDefault}`,
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'background 0.2s, border-color 0.2s',
                      flexShrink: 0,
                    }}
                  >
                    <div style={{
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      top: 2,
                      left: ((data[field.key] as boolean) ?? (field.defaultValue as boolean)) ? 18 : 2,
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                    }} />
                  </div>
                  <span style={{ fontSize: 12, color: tokens.textSecondary }}>
                    {((data[field.key] as boolean) ?? (field.defaultValue as boolean)) ? '已启用' : '未启用'}
                  </span>
                </label>
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  value={(data[field.key] as number) ?? (field.defaultValue as number ?? 0)}
                  onChange={(e) => onUpdate(node.id, { ...data, [field.key]: Number(e.target.value) })}
                  style={fieldStyle}
                />
              )}

              {field.type === 'text' && (
                <input
                  type="text"
                  value={(data[field.key] as string) ?? ''}
                  placeholder={field.placeholder}
                  onChange={(e) => onUpdate(node.id, { ...data, [field.key]: e.target.value })}
                  style={fieldStyle}
                />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{
        padding: `${tokens.sp1}px ${tokens.sp3}px`,
        borderTop: `1px solid ${tokens.borderMuted}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: tokens.bgElevated,
      }}>
        <span style={{ fontSize: 10, color: tokens.textMuted }}>
          {fields.length > 0 ? `${fields.length} 个配置项` : '只读节点'}
        </span>
        <div style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: tokens.success,
          opacity: 0.7,
        }} />
      </div>
    </aside>
  );
}
