# [deprecated]WKWebView+JSPatch注入代码，实现H5与原生页面的灵活交互
多人的项目都会用到UIWebView或WKWebView，时常要让H5页面和原生页面交互。

常见的方法有url拦截（UIWebView，WKWebView都支持），最典型的应该是WebViewJavaScriptBridge利用看不见的iframe来实现的方法。

还有就是通过JavaScriptCore （UIWebView支持，WKWebView不支持）来实现。

我介绍的是一种很另类的方法，也没见过别人用过，但我试着用于生产中了,对线程和内存管理理解的好的话,这种方法会很灵活好用。

将WKWebView和JSPatch结合起来使用，从而向APP里注入代码。

这样做能让H5页面和原生页面的交互大大加强。

若不了解JSPatch可以先看看JSPatch.

ws
先扔Demo.

初始化WKWebView
若要通过H5页面导入脚本，就得让WKWebView和原生层面能够交互。

_rwWebView=[[WKWebView alloc]initWithFrame:CGRectMake(0, 0, self.view.frame.size.width, self.view.frame.size.height)];
[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"LoadScript"];
[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"DoFunction"];
.
.
.
[self.view addSubview:_rwWebView];
NSURL *url=[[NSBundle mainBundle]URLForResource:@"index" withExtension:@"html"];
NSMutableURLRequest *tmpRequest=[[NSMutableURLRequest alloc] initWithURL:url];
tmpRequest.timeoutInterval=60;
[_rwWebView loadRequest:tmpRequest];
关键的两句话是：

[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"LoadScript"];
[_rwWebView.configuration.userContentController addScriptMessageHandler:self name:@"DoFunction"];
self必须得遵循【WKScriptMessageHandler】协议。
LoadScript和DoFunction就相当于消息处理者。然后会在JS脚本中被用到。

在H5中需要执行的JS代码是:

function loadScript() {
window.webkit.messageHandlers.LoadScript.postMessage("require\('SecondViewController');\
defineClass('ViewController',{\
goSecondVC: function() {\
var svc=SecondViewController.alloc().init();\
self.presentViewController_animated_completion(svc,YES,null);\
},});"
);}
function doFunction() {
window.webkit.messageHandlers.DoFunction.postMessage({function:"goSecondVC",parameters:{}})
}
postMessage()里面的参数可以是：Number, String, Date, Array,
Dictionary, and null.和OC对应关系为:

JS	OC
Number	NSNumber
String	NSString
Date	NSDate
Array	NSArray
Dictionary	NSDictionary
null	NSNull
下面是官方注释:

/*! @abstract The body of the message.
@discussion Allowed types are NSNumber, NSString, NSDate, NSArray,
NSDictionary, and NSNull.
*/
@property (nonatomic, readonly, copy) id body;
【WKScriptMessageHandler】协议的回调写法：

- (void)userContentController:(WKUserContentController *)userContentController
  didReceiveScriptMessage:(WKScriptMessage *)message{
  if ([message.name isEqualToString:@"LoadScript"]) {
  NSString *script=message.body;
  [JPEngine evaluateScript:script];
  NSLog(@"Script loaded");
  }
  else if ([message.name isEqualToString:@"DoFunction"])
  {
  NSDictionary *messageDic=message.body;
  NSString *function=messageDic[@"function"];
  NSDictionary *parameters=messageDic[@"parameters"];
  if ([self respondsToSelector:NSSelectorFromString(function)]) {
  [self performSelectorOnMainThread:NSSelectorFromString(function) withObject:parameters waitUntilDone:YES];
  NSLog(@"Script excuted");

        }
        else NSLog(@"Please load script first");
  }

}
H5执行loadScript()后会执行

    NSString *script=message.body;
    [JPEngine evaluateScript:script];
    NSLog(@"Script loaded");
}
[JPEngine evaluateScript:script]会将脚本转换为原生代码，即把script中的方法在APP运行时注册。

H5执行doFunction后会执行：

NSDictionary *messageDic=message.body;
NSString *function=messageDic[@"function"];
NSDictionary *parameters=messageDic[@"parameters"];
if ([self respondsToSelector:NSSelectorFromString(function)]) {
[self performSelectorOnMainThread:NSSelectorFromString(function) withObject:parameters waitUntilDone:YES];
NSLog(@"Script excuted");

}
else NSLog(@"Please load script first");
很简单的实现了H5向原生注入代码。

Demo的问题：
1.注入的代码会曝光在浏览器中，最好使用aes加密,

可以使用我写的一个加密工具CryptoBuff.

2.window.webkit.messageHandlers.YourHandlerName.postMessage()是在子线程中执行的。

所以"- (void)userContentController:(WKUserContentController *)userContentController
didReceiveScriptMessage:(WKScriptMessage *)message"是异步回调的。

JSPatch脚本里必须很小心，得注意线程安全。比如在脚本里使用self，但是self实际上已经被释放的情况，所以有时要用“isEqual”: 去核对内存地址。

作者：R4L
链接：https://www.jianshu.com/p/6c44e4267ff5
来源：简书
著作权归作者所有。商业转载请联系作者获得授权，非商业转载请注明出处。
