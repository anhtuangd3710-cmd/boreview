import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chính sách bảo mật',
  description: 'Chính sách bảo mật của chúng tôi giải thích cách chúng tôi thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.',
};

export default function PrivacyPolicyPage() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'Bơ Review';
  const lastUpdated = '8 tháng 2, 2026';

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Chính sách bảo mật</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Cập nhật lần cuối: {lastUpdated}</p>

        <div className="prose dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">1. Giới thiệu</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chào mừng bạn đến với {siteName} (&quot;chúng tôi&quot;). Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ và bảo vệ thông tin của bạn khi bạn truy cập website của chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">2. Thông tin chúng tôi thu thập</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Chúng tôi có thể thu thập thông tin về bạn theo nhiều cách:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Dữ liệu cá nhân:</strong> Tên, địa chỉ email và thông tin liên hệ khác mà bạn tự nguyện cung cấp.</li>
              <li><strong>Dữ liệu sử dụng:</strong> Thông tin về cách bạn sử dụng website, bao gồm các trang đã truy cập và thời gian sử dụng.</li>
              <li><strong>Cookie:</strong> Các tệp dữ liệu nhỏ được lưu trên thiết bị của bạn để nâng cao trải nghiệm duyệt web.</li>
              <li><strong>Dữ liệu phân tích:</strong> Dữ liệu ẩn danh được thu thập thông qua dịch vụ phân tích để hiểu hành vi người dùng.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">3. Cách chúng tôi sử dụng thông tin của bạn</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Chúng tôi sử dụng thông tin thu thập được để:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Cung cấp, duy trì và cải thiện website và dịch vụ</li>
              <li>Phản hồi bình luận, câu hỏi và yêu cầu của bạn</li>
              <li>Gửi bản tin và tài liệu quảng cáo (với sự đồng ý của bạn)</li>
              <li>Giám sát và phân tích xu hướng và mẫu sử dụng</li>
              <li>Bảo vệ chống truy cập trái phép và trách nhiệm pháp lý</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">4. Dịch vụ bên thứ ba</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Chúng tôi có thể sử dụng các dịch vụ bên thứ ba thu thập thông tin:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li><strong>Google Analytics:</strong> Để phân tích lưu lượng website</li>
              <li><strong>Google AdSense:</strong> Để hiển thị quảng cáo phù hợp</li>
              <li><strong>YouTube:</strong> Để nhúng nội dung video</li>
            </ul>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mt-4">
              Các dịch vụ này có chính sách bảo mật riêng. Chúng tôi khuyến khích bạn xem xét chúng.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">5. Chính sách Cookie</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi sử dụng cookie và công nghệ theo dõi tương tự để nâng cao trải nghiệm của bạn. Bạn có thể yêu cầu trình duyệt từ chối tất cả cookie hoặc thông báo khi cookie được gửi. Tuy nhiên, một số tính năng có thể không hoạt động đúng nếu không có cookie.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">6. Bảo mật dữ liệu</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi thực hiện các biện pháp bảo mật kỹ thuật và tổ chức phù hợp để bảo vệ thông tin cá nhân của bạn. Tuy nhiên, không có phương thức truyền tải qua Internet nào an toàn 100%, và chúng tôi không thể đảm bảo an ninh tuyệt đối.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">7. Quyền của bạn</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">Tùy thuộc vào vị trí của bạn, bạn có thể có quyền:</p>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của bạn</li>
              <li>Phản đối hoặc hạn chế việc xử lý dữ liệu của bạn</li>
              <li>Di chuyển dữ liệu</li>
              <li>Rút lại sự đồng ý bất cứ lúc nào</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">8. Quyền riêng tư của trẻ em</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Website của chúng tôi không dành cho trẻ em dưới 13 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 13 tuổi. Nếu bạn tin rằng chúng tôi đã thu thập thông tin như vậy, vui lòng liên hệ ngay với chúng tôi.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">9. Thay đổi chính sách này</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Chúng tôi sẽ thông báo cho bạn về bất kỳ thay đổi nào bằng cách đăng chính sách mới trên trang này và cập nhật ngày &quot;Cập nhật lần cuối&quot;.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">10. Liên hệ</h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Nếu bạn có câu hỏi về Chính sách bảo mật này, vui lòng liên hệ với chúng tôi qua:{' '}
              <a href="/contact" className="text-primary-600 dark:text-primary-400 hover:underline">trang liên hệ</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

