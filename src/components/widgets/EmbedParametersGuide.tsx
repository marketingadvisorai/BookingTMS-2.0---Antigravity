import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Info } from 'lucide-react';

export function EmbedParametersGuide() {
  const parameters = [
    {
      name: 'widget',
      type: 'string',
      required: true,
      default: 'farebook',
      description: 'The widget type identifier',
      example: 'farebook, calendar, bookgo, resolvex',
    },
    {
      name: 'color',
      type: 'hex',
      required: false,
      default: '2563eb',
      description: 'Primary brand color (without # symbol)',
      example: '2563eb, ff0000, 00ff00',
    },
    {
      name: 'key',
      type: 'string',
      required: true,
      default: '',
      description: 'Your unique widget authentication key',
      example: 'wdgt_abc123xyz',
    },
  ];

  const heightRecommendations = [
    { widget: 'FareBook Widget', minHeight: '800px', recommended: '800px' },
    { widget: 'Calendar Widget', minHeight: '700px', recommended: '750px' },
    { widget: 'BookGo Widget', minHeight: '600px', recommended: '700px' },
    { widget: 'Resolvex Widget', minHeight: '650px', recommended: '750px' },
    { widget: 'Quick Booking', minHeight: '500px', recommended: '550px' },
    { widget: 'Multi-Step', minHeight: '700px', recommended: '800px' },
    { widget: 'Single Game', minHeight: '600px', recommended: '700px' },
  ];

  return (
    <div className="space-y-4">
      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <CardTitle className="text-base">URL Parameters Reference</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Parameter</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Type</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Required</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Default</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-900">Description</th>
                </tr>
              </thead>
              <tbody>
                {parameters.map((param, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-3">
                      <code className="bg-gray-100 px-2 py-1 rounded text-blue-600">
                        {param.name}
                      </code>
                    </td>
                    <td className="py-3 px-3 text-gray-600">{param.type}</td>
                    <td className="py-3 px-3">
                      {param.required ? (
                        <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                          Required
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                          Optional
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <code className="text-gray-600">{param.default || '-'}</code>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      <div>{param.description}</div>
                      <div className="text-gray-500 mt-1">
                        Examples: <code className="text-xs">{param.example}</code>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Recommended Heights by Widget</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {heightRecommendations.map((item, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium text-gray-900">{item.widget}</p>
                  <Badge variant="secondary" className="text-xs">
                    {item.recommended}
                  </Badge>
                </div>
                <p className="text-xs text-gray-600">
                  Min: <code className="bg-white px-1 rounded">{item.minHeight}</code> | 
                  Best: <code className="bg-white px-1 rounded">{item.recommended}</code>
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-200">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Example URLs</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Basic Embed</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
              https://your-site.com/embed?widget=farebook&key=wdgt_abc123
            </code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">With Custom Color</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
              https://your-site.com/embed?widget=farebook&color=ff6b6b&key=wdgt_abc123
            </code>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 mb-1">Different Widget Type</p>
            <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-xs overflow-x-auto">
              https://your-site.com/embed?widget=calendar&color=2563eb&key=wdgt_abc123
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
