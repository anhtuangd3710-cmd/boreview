import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Điều khoản sử dụng',
  description: 'Đọc điều khoản sử dụng của chúng tôi để hiểu quyền và trách nhiệm của bạn khi sử dụng website.',
};

export default function TermsPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bơ Review';
  const lastUpdated = '8 tháng 2, 2026';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Điều khoản sử dụng</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Cập nhật lần cuối: {lastUpdated}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Chấp nhận điều khoản</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Bằng việc truy cập và sử dụng {siteName} (&quot;Website&quot;), bạn chấp nhận và đồng ý tuân theo các Điều khoản sử dụng này. Nếu bạn không đồng ý với các điều khoản này, vui lòng không sử dụng Website của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Sử dụng nội dung</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              Tất cả nội dung trên Website này, bao gồm văn bản, đồ họa, logo, hình ảnh và video, là tài sản của {siteName} hoặc các nhà cung cấp nội dung và được bảo vệ bởi luật bản quyền.
            </p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Bạn chỉ có thể xem và in nội dung cho mục đích cá nhân, phi thương mại</li>
              <li>Bạn không được sao chép, phân phối hoặc tạo tác phẩm phái sinh mà không có sự cho phép</li>
              <li>Bạn có thể chia sẻ liên kết đến nội dung của chúng tôi với sự ghi nhận phù hợp</li>
              <li>Bạn không được sử dụng nội dung của chúng tôi cho mục đích thương mại mà không có sự đồng ý bằng văn bản</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Hành vi người dùng</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Khi sử dụng Website, bạn đồng ý không:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Vi phạm bất kỳ luật hoặc quy định hiện hành nào</li>
              <li>Xâm phạm quyền của người khác</li>
              <li>Đăng hoặc truyền tải nội dung có hại, đe dọa hoặc xúc phạm</li>
              <li>Cố gắng truy cập trái phép vào hệ thống của chúng tôi</li>
              <li>Can thiệp vào hoạt động bình thường của Website</li>
              <li>Sử dụng hệ thống tự động để truy cập Website mà không có sự cho phép</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Từ chối bảo đảm</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Website và nội dung của nó được cung cấp &quot;nguyên trạng&quot; mà không có bất kỳ bảo đảm nào, dù rõ ràng hay ngụ ý. Chúng tôi không đảm bảo tính chính xác, đầy đủ hoặc hữu ích của bất kỳ thông tin nào trên Website. Việc sử dụng Website là rủi ro của riêng bạn.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Giới hạn trách nhiệm</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Trong phạm vi tối đa được pháp luật cho phép, {siteName} sẽ không chịu trách nhiệm về bất kỳ thiệt hại gián tiếp, ngẫu nhiên, đặc biệt, hậu quả hoặc trừng phạt nào phát sinh từ việc bạn sử dụng Website hoặc bất kỳ nội dung nào trong đó.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Liên kết bên thứ ba</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Website của chúng tôi có thể chứa liên kết đến các website bên thứ ba. Chúng tôi không chịu trách nhiệm về nội dung, chính sách bảo mật hoặc điều khoản dịch vụ của các trang web bên ngoài này. Chúng tôi khuyến khích bạn xem xét các điều khoản và chính sách của bất kỳ website bên thứ ba nào bạn truy cập.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Nội dung nhúng</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi có thể nhúng video từ YouTube và các nền tảng khác. Các nội dung nhúng này tuân theo điều khoản dịch vụ của nền tảng tương ứng. Chúng tôi chỉ nhúng nội dung mà chúng tôi sở hữu hoặc có sự cho phép sử dụng.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Quảng cáo</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi có thể hiển thị quảng cáo trên Website thông qua các mạng quảng cáo bên thứ ba như Google AdSense. Các quảng cáo này có thể sử dụng cookie để phục vụ quảng cáo dựa trên sở thích của bạn. Bạn có thể từ chối quảng cáo được cá nhân hóa thông qua cài đặt trình duyệt hoặc các mạng quảng cáo tương ứng.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Sửa đổi điều khoản</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi có quyền sửa đổi các Điều khoản sử dụng này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải. Việc bạn tiếp tục sử dụng Website sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản đã sửa đổi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Luật áp dụng</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Các Điều khoản sử dụng này sẽ được điều chỉnh và giải thích theo luật pháp hiện hành, không tính đến các nguyên tắc xung đột pháp luật.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">11. Thông tin liên hệ</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nếu bạn có bất kỳ câu hỏi nào về các Điều khoản sử dụng này, vui lòng liên hệ với chúng tôi qua{' '}
              <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">trang liên hệ</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

